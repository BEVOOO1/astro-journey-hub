import { Publication } from "@/types/publication";

export const parseCSV = async (): Promise<Publication[]> => {
  try {
    const response = await fetch("/data/nasa_enhanced_data.csv");
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
          journal: values[3] || "",
          date: values[4] || "",
          abstract: values[5] || "",
          main_content: values[6] || "",
          full_content: values[7] || "",
          content_length: values[8] || "",
          topics: values[9] || "",
          keywords: values[10] || "",
          entities: values[11] || "",
          timeline_date: values[12] || "",
          timeline_year: values[13] || "",
          timeline_components: values[14] || "",
          domain: values[15] || "",
          source: values[16] || "",
          scraped_date: values[17] || "",
          status: values[18] || "",
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
  
  // Parse keywords from CSV (semicolon separated)
  const keywordList = publication.keywords.split(';').map(k => k.trim()).filter(Boolean);
  
  // Extract common research themes
  if (keywords.includes("microgravity") || keywords.includes("gravity")) tags.push("Microgravity");
  if (keywords.includes("bone") || keywords.includes("skeletal")) tags.push("Bone Health");
  if (keywords.includes("muscle")) tags.push("Muscle");
  if (keywords.includes("immune")) tags.push("Immune System");
  if (keywords.includes("cardiovascular") || keywords.includes("heart")) tags.push("Cardiovascular");
  if (keywords.includes("radiation")) tags.push("Radiation");
  if (keywords.includes("stem cell")) tags.push("Stem Cells");
  if (keywords.includes("cancer")) tags.push("Cancer");
  if (keywords.includes("regeneration")) tags.push("Regeneration");
  if (keywords.includes("gene") || keywords.includes("genetic")) tags.push("Genetics");
  if (keywords.includes("space")) tags.push("Space Research");
  if (keywords.includes("biology") || keywords.includes("biological")) tags.push("Biology");
  if (keywords.includes("molecular")) tags.push("Molecular");
  if (keywords.includes("cellular")) tags.push("Cellular");
  if (keywords.includes("experiment")) tags.push("Experimental");
  
  return [...new Set(tags)];
};

export const extractCategories = (publication: Publication): string[] => {
  const categories: string[] = [];
  const content = `${publication.abstract} ${publication.keywords} ${publication.topics}`.toLowerCase();
  
  // Use topics field for better categorization
  const topics = publication.topics.toLowerCase();
  
  if (content.includes("mouse") || content.includes("mice") || content.includes("rodent")) {
    categories.push("Animal Studies");
  }
  if (content.includes("human") || content.includes("astronaut")) {
    categories.push("Human Research");
  }
  if (topics.includes("cellular") || topics.includes("molecular") || content.includes("cell")) {
    categories.push("Cellular & Molecular");
  }
  if (content.includes("tissue") || content.includes("organ")) {
    categories.push("Tissue & Organ");
  }
  if (content.includes("biosatellite") || content.includes("space station") || content.includes("shuttle") || content.includes("mission")) {
    categories.push("Space Mission");
  }
  if (topics.includes("biology") || topics.includes("biological")) {
    categories.push("Biology");
  }
  if (topics.includes("technology") || topics.includes("experiment")) {
    categories.push("Technology");
  }
  if (topics.includes("research")) {
    categories.push("Research");
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
