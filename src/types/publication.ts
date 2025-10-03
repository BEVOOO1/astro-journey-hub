export interface Publication {
  title: string;
  url: string;
  authors: string;
  journal: string;
  date: string;
  abstract: string;
  main_content: string;
  full_content: string;
  content_length: string;
  topics: string;
  keywords: string;
  entities: string;
  timeline_date: string;
  timeline_year: string;
  timeline_components: string;
  domain: string;
  source: string;
  scraped_date: string;
  status: string;
}

export type UserType = "scientist" | "explorer" | "adventurer";
