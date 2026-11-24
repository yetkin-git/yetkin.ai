/** Kurum dosya şablonu. Tutar ve oran taşımaz. */

export type GrantTemplateSection = {
  id: string;
  title: string;
  required: boolean;
};

export type GrantTemplateField = {
  id: string;
  label: string;
  required: boolean;
};

export type GrantTemplatePackage = {
  id: string;
  name: string;
  successMeasure: string;
};

export type GrantInstitutionTemplate = {
  id: string;
  title: string;
  sections: readonly GrantTemplateSection[];
  requiredFields: readonly GrantTemplateField[];
  workPackages: readonly GrantTemplatePackage[];
  successCriteriaLabel: string;
};
