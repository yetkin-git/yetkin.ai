/**
 * İnce SMTP — Resend/SDK yok. Boş env ile çağrılmaz.
 * Port 465: örtük TLS. Diğerleri: STARTTLS.
 */

import { createConnection, type Socket } from "node:net";
import { connect as tlsConnect, type TLSSocket } from "node:tls";

export type NoticeSmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

export type NoticeSmtpMail = {
  to: string;
  subject: string;
  text: string;
};

const SMTP_TIMEOUT_MS = 8_000;
const CRLF = "\r\n";

function encodeSubject(subject: string): string {
  if (/^[\x20-\x7e]+$/.test(subject)) {
    return subject;
  }
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}

function quoteAddress(value: string): string {
  return value.replace(/[\r\n<>]/g, "");
}

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("smtp_timeout")), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

class SmtpSession {
  private buffer = "";

  constructor(private readonly socket: Socket | TLSSocket) {}

  async readCode(expected: number): Promise<string> {
    for (;;) {
      const newline = this.buffer.indexOf("\n");
      if (newline >= 0) {
        const line = this.buffer.slice(0, newline).replace(/\r$/, "");
        this.buffer = this.buffer.slice(newline + 1);
        const code = Number.parseInt(line.slice(0, 3), 10);
        const more = line[3] === "-";
        if (!more) {
          if (code !== expected) {
            throw new Error(`smtp_${code || "protocol"}`);
          }
          return line;
        }
        continue;
      }
      const chunk = await new Promise<string>((resolve, reject) => {
        const onData = (data: Buffer) => {
          cleanup();
          resolve(data.toString("utf8"));
        };
        const onError = (error: Error) => {
          cleanup();
          reject(error);
        };
        const onEnd = () => {
          cleanup();
          reject(new Error("smtp_closed"));
        };
        const cleanup = () => {
          this.socket.off("data", onData);
          this.socket.off("error", onError);
          this.socket.off("end", onEnd);
        };
        this.socket.once("data", onData);
        this.socket.once("error", onError);
        this.socket.once("end", onEnd);
      });
      this.buffer += chunk;
    }
  }

  async command(line: string, expected: number): Promise<string> {
    this.socket.write(`${line}${CRLF}`);
    return this.readCode(expected);
  }
}

function connectPlain(host: string, port: number): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    const onError = (error: Error) => {
      socket.destroy();
      reject(error);
    };
    socket.setTimeout(SMTP_TIMEOUT_MS, () => {
      socket.destroy();
      reject(new Error("smtp_timeout"));
    });
    socket.once("connect", () => {
      socket.off("error", onError);
      resolve(socket);
    });
    socket.once("error", onError);
  });
}

function upgradeTls(socket: Socket, host: string): Promise<TLSSocket> {
  return new Promise((resolve, reject) => {
    const tlsSocket = tlsConnect({ socket, host, servername: host });
    const onError = (error: Error) => {
      tlsSocket.destroy();
      reject(error);
    };
    tlsSocket.setTimeout(SMTP_TIMEOUT_MS, () => {
      tlsSocket.destroy();
      reject(new Error("smtp_timeout"));
    });
    tlsSocket.once("secureConnect", () => {
      tlsSocket.off("error", onError);
      resolve(tlsSocket);
    });
    tlsSocket.once("error", onError);
  });
}

function connectTls(host: string, port: number): Promise<TLSSocket> {
  return new Promise((resolve, reject) => {
    const socket = tlsConnect({ host, port, servername: host });
    const onError = (error: Error) => {
      socket.destroy();
      reject(error);
    };
    socket.setTimeout(SMTP_TIMEOUT_MS, () => {
      socket.destroy();
      reject(new Error("smtp_timeout"));
    });
    socket.once("secureConnect", () => {
      socket.off("error", onError);
      resolve(socket);
    });
    socket.once("error", onError);
  });
}

async function authenticate(session: SmtpSession, user: string, pass: string): Promise<void> {
  if (!user || !pass) {
    return;
  }
  await session.command("AUTH LOGIN", 334);
  await session.command(Buffer.from(user, "utf8").toString("base64"), 334);
  await session.command(Buffer.from(pass, "utf8").toString("base64"), 235);
}

export async function sendNoticeSmtp(config: NoticeSmtpConfig, mail: NoticeSmtpMail): Promise<void> {
  const host = config.host.trim();
  const from = quoteAddress(config.from.trim());
  const to = quoteAddress(mail.to.trim());
  const implicitTls = config.port === 465;
  const socket = implicitTls ? await connectTls(host, config.port) : await connectPlain(host, config.port);
  let session = new SmtpSession(socket);
  try {
    await withTimeout(
      (async () => {
        await session.readCode(220);
        await session.command(`EHLO rail`, 250);
        if (!implicitTls) {
          await session.command("STARTTLS", 220);
          const tlsSocket = await upgradeTls(socket, host);
          session = new SmtpSession(tlsSocket);
          await session.command(`EHLO rail`, 250);
        }
        await authenticate(session, config.user, config.pass);
        await session.command(`MAIL FROM:<${from}>`, 250);
        await session.command(`RCPT TO:<${to}>`, 250);
        await session.command("DATA", 354);
        const body = [
          `From: ${from}`,
          `To: ${to}`,
          `Subject: ${encodeSubject(mail.subject)}`,
          "MIME-Version: 1.0",
          "Content-Type: text/plain; charset=UTF-8",
          "Content-Transfer-Encoding: 8bit",
          "",
          mail.text.replace(/\r?\n/g, CRLF),
          ".",
        ].join(CRLF);
        await session.command(body, 250);
        await session.command("QUIT", 221);
      })(),
      SMTP_TIMEOUT_MS,
    );
  } finally {
    socket.destroy();
  }
}
