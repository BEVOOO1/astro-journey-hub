export interface Publication {
  title: string;
  url: string;
  authors: string;
  date: string;
  journal: string;
  doi: string;
  keywords: string;
  abstract: string;
  content: string;
  sections: string;
  scraped_date: string;
  status: string;
}

export type UserType = "scientist" | "explorer" | "adventurer";
