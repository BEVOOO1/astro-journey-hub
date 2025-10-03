import { Publication } from "@/types/publication";

export const parseCSV = async (): Promise<Publication[]> => {
  try {
    const response = await fetch("/data/nasa_publications_rag.csv");
    const text = await response.text();
    
    const lines = text.split("\n");
    const headers = lines[0].split(",");
    
    const publications: Publication[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle CSV parsing with potential commas in fields
      const values: string[] = [];
      let currentValue = "";
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentValue);
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);
      
      if (values.length >= headers.length) {
        publications.push({
          title: values[0] || "",
          url: values[1] || "",
          authors: values[2] || "",
          date: values[3] || "",
          journal: values[4] || "",
          doi: values[5] || "",
          keywords: values[6] || "",
          abstract: values[7] || "",
          content: values[8] || "",
          sections: values[9] || "",
          scraped_date: values[10] || "",
          status: values[11] || "",
        });
      }
    }
    
    return publications;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return [];
  }
};

export const extractTags = (publication: Publication): string[] => {
  const keywords = publication.keywords.toLowerCase();
  const tags: string[] = [];
  
  // Extract common research themes
  if (keywords.includes("microgravity")) tags.push("Microgravity");
  if (keywords.includes("bone") || keywords.includes("skeletal")) tags.push("Bone Health");
  if (keywords.includes("muscle")) tags.push("Muscle");
  if (keywords.includes("immune")) tags.push("Immune System");
  if (keywords.includes("cardiovascular") || keywords.includes("heart")) tags.push("Cardiovascular");
  if (keywords.includes("radiation")) tags.push("Radiation");
  if (keywords.includes("stem cell")) tags.push("Stem Cells");
  if (keywords.includes("cancer")) tags.push("Cancer");
  if (keywords.includes("regeneration")) tags.push("Regeneration");
  if (keywords.includes("gene") || keywords.includes("genetic")) tags.push("Genetics");
  
  return [...new Set(tags)];
};

export const extractCategories = (publication: Publication): string[] => {
  const categories: string[] = [];
  const content = `${publication.abstract} ${publication.keywords}`.toLowerCase();
  
  if (content.includes("mouse") || content.includes("mice") || content.includes("rodent")) {
    categories.push("Animal Studies");
  }
  if (content.includes("human") || content.includes("astronaut")) {
    categories.push("Human Research");
  }
  if (content.includes("cell") || content.includes("molecular")) {
    categories.push("Cellular & Molecular");
  }
  if (content.includes("tissue") || content.includes("organ")) {
    categories.push("Tissue & Organ");
  }
  if (content.includes("biosatellite") || content.includes("space station") || content.includes("shuttle")) {
    categories.push("Space Mission");
  }
  
  return [...new Set(categories)];
};

export const getYearFromDate = (dateString: string): string => {
  try {
    const year = dateString.split(" ").pop() || "";
    return year;
  } catch {
    return "";
  }
};
