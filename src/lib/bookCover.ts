type ThemeLike = { id: string; label: string; labelZh: string; emoji: string };

export type ScholarlyProfile = {
  scholarlyTitleEn: string;
  scholarlyTitleZh: string;
  professorName: string;
  professorTitle: string;
  seriesName: string;
  subfieldZh: string;
  visualSubjectEn: string;
  visualBackdropEn: string;
};

export const INITIAL_DEFAULT_PROFILE: ScholarlyProfile = {
  scholarlyTitleEn: "Young Scholar Monograph",
  scholarlyTitleZh: "《青年學者專屬學術專著》",
  professorName: "Prof. Julian Vance, Ph.D.",
  professorTitle: "Oxford & Cambridge Academic Advisory Board",
  seriesName: "KIDSMYBOOK · YOUNG SCHOLAR MONOGRAPH SERIES",
  subfieldZh: "自然科學與專題探究",
  visualSubjectEn: "A magnificent golden astronomical armillary sphere and celestial astrolabe with intricate gearworks and glowing starlight prisms on dark obsidian backdrop",
  visualBackdropEn: "Celestial coordinates and astronomical observation field schematics on dark textured parchment",
};

export function getScholarlyProfile(topicInput: string, authorName: string): ScholarlyProfile {
  const t = topicInput.trim().toLowerCase();
  const rawTopic = topicInput.trim();
  const author = authorName.trim() || "Young Scholar";

  if (!rawTopic) {
    return INITIAL_DEFAULT_PROFILE;
  }

  // 1. Tanks & Armored Vehicles & Military
  if (
    t.includes("tank") ||
    t.includes("坦克") ||
    t.includes("戰車") ||
    t.includes("裝甲") ||
    t.includes("軍事") ||
    t.includes("軍武") ||
    t.includes("炮") ||
    t.includes("武器") ||
    t.includes("armor") ||
    t.includes("military") ||
    t.includes("artillery")
  ) {
    return {
      scholarlyTitleEn: "Armored Dynamics & Heavy Combat Systems: Architectural Principles of Modern Tank Engineering",
      scholarlyTitleZh: "《現代重裝甲動力學與戰車機械工程論》",
      professorName: "Prof. Julian Hayes, Ph.D.",
      professorTitle: "Chair of Defense Mechanics & Ballistic Systems · Royal Institute Fellow",
      seriesName: "MONOGRAPH IN ADVANCED MECHANICAL & ARMORED SYSTEMS",
      subfieldZh: "重型裝甲與戰車機械工程",
      visualSubjectEn: "A formidable modern main battle tank, heavy armored combat vehicle with intricate metal tracks, composite armor plating, high-precision turret and cannon barrel, illuminated in dramatic cinematic studio low-angle chiaroscuro lighting with subtle technical blueprint line details",
      visualBackdropEn: "Technical mechanical blueprint schematics of armored tank chassis and turret cross-section on dark textured background",
    };
  }

  // 2. Aviation, Fighter Jets & Airplanes
  if (
    t.includes("飛機") ||
    t.includes("戰機") ||
    t.includes("飛行") ||
    t.includes("航天") ||
    t.includes("航空") ||
    t.includes("airplane") ||
    t.includes("plane") ||
    t.includes("jet") ||
    t.includes("fighter") ||
    t.includes("aviation") ||
    t.includes("aircraft") ||
    t.includes("helicopter") ||
    t.includes("直升機")
  ) {
    return {
      scholarlyTitleEn: "Aerodynamics & Supersonic Aviation: Structural Engineering of Modern Fighter Aircraft",
      scholarlyTitleZh: "《超音速空氣動力學與現代戰機結構專論》",
      professorName: "Prof. Edward Mitchell, Ph.D.",
      professorTitle: "Chair of Aeronautical & Aerospace Engineering · AIAA Senior Fellow",
      seriesName: "ADVANCED AEROSPACE & AVIATION MONOGRAPH SERIES",
      subfieldZh: "空氣動力學與航空航天工程",
      visualSubjectEn: "A sleek modern supersonic stealth fighter aircraft, aerodynamic swept wings, dual afterburners glowing with blue thrust, soaring against a dramatic dark storm cloudscape with gold sunset rim lighting, precision aviation engineering aesthetic",
      visualBackdropEn: "Aeronautical airflow simulation vector grid and supersonic aircraft flight schematics",
    };
  }

  // 3. Supercars, Racing & Automotive
  if (
    t.includes("車") ||
    t.includes("汽車") ||
    t.includes("跑車") ||
    t.includes("賽車") ||
    t.includes("car") ||
    t.includes("supercar") ||
    t.includes("racing") ||
    t.includes("automotive") ||
    t.includes("vehicle")
  ) {
    return {
      scholarlyTitleEn: "Kinematics of High-Performance Supercars: Aerodynamic Chassis and Powertrain Dynamics",
      scholarlyTitleZh: "《極限超跑空氣動力學與底盤動力工程論》",
      professorName: "Prof. Marco Rossi, Ph.D.",
      professorTitle: "Institute of High-Performance Automotive Engineering · SAE Fellow",
      seriesName: "MONOGRAPH IN AUTOMOTIVE DYNAMICS & RACING ENGINEERING",
      subfieldZh: "車輛工程與動力底盤系統",
      visualSubjectEn: "A stunning high-performance luxury supercar, sculpted carbon-fiber bodywork, luminous LED headlights, exposed high-tech wheel rims, dramatic studio spotlighting on dark reflective obsidian floor",
      visualBackdropEn: "Automotive chassis suspension geometry blueprint and aerodynamic wind tunnel stream vectors",
    };
  }

  // 4. Trains & Railways
  if (
    t.includes("火車") ||
    t.includes("高鐵") ||
    t.includes("鐵路") ||
    t.includes("列車") ||
    t.includes("train") ||
    t.includes("locomotive") ||
    t.includes("railway")
  ) {
    return {
      scholarlyTitleEn: "Principles of High-Speed Rail & Locomotive Dynamics: Modern Railway Engineering",
      scholarlyTitleZh: "《高速鐵道動力學與現代機車車輛工程論》",
      professorName: "Prof. Heinrich Weber, Dr.-Ing.",
      professorTitle: "Faculty of Transport & Locomotive Engineering",
      seriesName: "TREATISE IN ADVANCED RAILWAY SYSTEMS",
      subfieldZh: "高速軌道交通與牽引動力工程",
      visualSubjectEn: "A high-speed bullet train gliding along a high-tech modern viaduct bridge at twilight, aerodynamic nose cone, sleek metallic finish, dramatic cinematic motion lighting",
      visualBackdropEn: "Railway track geometry schematic and high-speed locomotive propulsion cross-section",
    };
  }

  // 5. Butterflies & Insects
  if (
    t.includes("蝶") ||
    t.includes("butterfly") ||
    t.includes("昆蟲") ||
    t.includes("insect") ||
    t.includes("甲蟲") ||
    t.includes("beetle") ||
    t.includes("蜜蜂") ||
    t.includes("bee") ||
    t.includes("蜻蜓") ||
    t.includes("dragonfly")
  ) {
    return {
      scholarlyTitleEn: "The Architecture of Lepidoptera: Field Taxonomy & Morphological Observations",
      scholarlyTitleZh: "《鱗翅目生態形態學與田野觀測誌》",
      professorName: "Prof. Julian Vance, Ph.D.",
      professorTitle: "Fellow of the Royal Entomological Society · Oxford Academic Advisor",
      seriesName: "MONOGRAPH IN APPLIED BIOLOGICAL SCIENCES",
      subfieldZh: "生物多樣性與昆蟲形態學",
      visualSubjectEn: "A magnificent iridescent butterfly specimen with crystalline wing scales, intricate micro-patterns and luminous emerald/sapphire veins, museum archive naturalist illustration, dramatic dark chiaroscuro lighting",
      visualBackdropEn: "Microscopic wing scale lattice diagram and botanical field taxonomy sketches",
    };
  }

  // 6. Deep Sea & Marine Biology
  if (
    t.includes("海") ||
    t.includes("ocean") ||
    t.includes("marine") ||
    t.includes("魚") ||
    t.includes("fish") ||
    t.includes("shark") ||
    t.includes("鯊") ||
    t.includes("鯨") ||
    t.includes("whale") ||
    t.includes("深海") ||
    t.includes("coral") ||
    t.includes("珊瑚") ||
    t.includes("水下") ||
    t.includes("underwater")
  ) {
    return {
      scholarlyTitleEn: "Abyssal Oceanography: Bioluminescent Ecology & Deep-Sea Hydrothermal Fauna",
      scholarlyTitleZh: "《深海生物發光生態系與大洋沈積環境研究》",
      professorName: "Prof. Alistair Thorne, Ph.D.",
      professorTitle: "Institute of Marine Oceanography · Senior Marine Scientist",
      seriesName: "TREATISE IN ADVANCED OCEAN SCIENCES",
      subfieldZh: "海洋生態學與深海生物探勘",
      visualSubjectEn: "An extraordinary bioluminescent deep-sea creature floating in the dark oceanic abyss, translucent glowing tentacles, ethereal deep oceanic trench lighting, luminous aquatic particles",
      visualBackdropEn: "Bathymetric ocean floor topography map and marine creature skeletal cross-section",
    };
  }

  // 7. Space, Astronomy & Planets
  if (
    t.includes("太空") ||
    t.includes("space") ||
    t.includes("天文") ||
    t.includes("astronomy") ||
    t.includes("星") ||
    t.includes("star") ||
    t.includes("宇宙") ||
    t.includes("cosmos") ||
    t.includes("rocket") ||
    t.includes("火箭") ||
    t.includes("planet") ||
    t.includes("行星") ||
    t.includes("黑洞") ||
    t.includes("black hole") ||
    t.includes("銀河") ||
    t.includes("galaxy")
  ) {
    return {
      scholarlyTitleEn: "Principles of Stellar Dynamics: An Observational Treatise on Deep Celestial Systems",
      scholarlyTitleZh: "《深空恆星動力學與天體觀測論》",
      professorName: "Prof. Arthur Sterling, Ph.D.",
      professorTitle: "Chair of Astrophysics & Planetary Sciences · Cambridge Senior Fellow",
      seriesName: "YOUNG SCHOLAR ASTROPHYSICS & COSMOLOGY SERIES",
      subfieldZh: "天體物理學與行星探測",
      visualSubjectEn: "A colossal spiraling cosmic galaxy with glowing core, interstellar nebular gas in deep violet and gold, an orbiting ringed exoplanet in foreground, deep-space telescope photography",
      visualBackdropEn: "Celestial spherical coordinate grid and orbital trajectory calculations diagram",
    };
  }

  // 8. Dinosaurs & Paleontology
  if (
    t.includes("恐龍") ||
    t.includes("dinosaur") ||
    t.includes("古生物") ||
    t.includes("化石") ||
    t.includes("fossil") ||
    t.includes("地質") ||
    t.includes("geology") ||
    t.includes("t-rex") ||
    t.includes("暴龍") ||
    t.includes("三角龍") ||
    t.includes("triceratops") ||
    t.includes("velociraptor")
  ) {
    return {
      scholarlyTitleEn: "Paleobiology of the Mesozoic: Comparative Skeletal Anatomy & Stratigraphic Records",
      scholarlyTitleZh: "《中生代古生物形態學與地層沉積學研究》",
      professorName: "Prof. Marcus Thorne, Sc.D.",
      professorTitle: "Faculty of Earth Sciences · Museum of Natural History Research Fellow",
      seriesName: "MONOGRAPH IN PALEOBIOLOGY & EARTH ARCHIVES",
      subfieldZh: "古生物形態學與地質沉積學",
      visualSubjectEn: "A powerful prehistoric dinosaur in a misty ancient primeval forest, hyper-detailed textured skin scales, muscular anatomical presence, museum-grade scientific paleoart with warm amber rim lighting",
      visualBackdropEn: "Stratigraphic geological rock layer columns and fossilized skeletal anatomical plates",
    };
  }

  // 9. Robotics, AI & Computing
  if (
    t.includes("機械") ||
    t.includes("機器") ||
    t.includes("robot") ||
    t.includes("ai") ||
    t.includes("人工智慧") ||
    t.includes("編程") ||
    t.includes("code") ||
    t.includes("晶片") ||
    t.includes("chip") ||
    t.includes("cyber") ||
    t.includes("電子") ||
    t.includes("circuit")
  ) {
    return {
      scholarlyTitleEn: "Autonomous Kinematics & Applied Cybernetic Systems: A Young Scholar's Monograph",
      scholarlyTitleZh: "《自律機械動力學與應用控制論專著》",
      professorName: "Prof. David C. Mitchell, Ph.D.",
      professorTitle: "Professor of Robotics & Cybernetics · IEEE Fellow",
      seriesName: "MONOGRAPH IN ADVANCED APPLIED SCIENCES & COMPUTING",
      subfieldZh: "智能機械與動力控制工程",
      visualSubjectEn: "An intricate cybernetic robotic mechanism, precision titanium actuators and exposed servomotor joints, glowing fiber-optic circuitry, dark minimalist high-tech aesthetic",
      visualBackdropEn: "Integrated circuit board schematic diagram and algorithmic control flow graph",
    };
  }

  // 10. Architecture & Castles / Cities
  if (
    t.includes("建築") ||
    t.includes("大樓") ||
    t.includes("橋樑") ||
    t.includes("城市") ||
    t.includes("architecture") ||
    t.includes("skyscraper") ||
    t.includes("bridge") ||
    t.includes("castle") ||
    t.includes("城堡") ||
    t.includes("city") ||
    t.includes("building")
  ) {
    return {
      scholarlyTitleEn: "Structural Architecture & Monumental Engineering: Principles of Urban Space",
      scholarlyTitleZh: "《結構建築學與紀念碑式城市空間工程論》",
      professorName: "Prof. Lawrence Vance, RIBA",
      professorTitle: "Faculty of Architecture & Monumental Heritage · Royal Institute",
      seriesName: "INTERNATIONAL MONOGRAPH IN STRUCTURAL ARCHITECTURE",
      subfieldZh: "結構建築學與城市空間設計",
      visualSubjectEn: "A monumental architectural structure, towering geometric glass and steel cantilevers, twilight golden hour lighting reflecting off dramatic facades, sharp architectural perspective",
      visualBackdropEn: "Architectural elevation floorplan and structural isometric blueprint",
    };
  }

  // 11. Knights, Medieval Warfare & History
  if (
    t.includes("騎士") ||
    t.includes("武士") ||
    t.includes("歷史") ||
    t.includes("羅馬") ||
    t.includes("三國") ||
    t.includes("鎧甲") ||
    t.includes("盔甲") ||
    t.includes("knight") ||
    t.includes("sword") ||
    t.includes("medieval") ||
    t.includes("history") ||
    t.includes("samurai") ||
    t.includes("shield") ||
    t.includes("盾") ||
    t.includes("劍")
  ) {
    return {
      scholarlyTitleEn: "Medieval Martial Chronicles: Armor Metallurgy, Strategy, and Fortification Design",
      scholarlyTitleZh: "《中世紀軍事防禦工程與騎士盔甲冶金誌》",
      professorName: "Prof. William Sterling, FBA",
      professorTitle: "Institute of Historical & Medieval Studies · Senior Academic Fellow",
      seriesName: "CAMBRIDGE MONOGRAPH IN HISTORICAL DEFENSE & CHRONICLES",
      subfieldZh: "古典軍事史與防禦工程學",
      visualSubjectEn: "A knight in engraved plate armor, holding an ornate sword, standing before an ancient stone archway, dramatic chiaroscuro torchlight reflecting off polished steel",
      visualBackdropEn: "Historical heraldic crests and castle fortification defense blueprints",
    };
  }

  // 12. Animals & Zoology
  if (
    t.includes("動物") ||
    t.includes("獅") ||
    t.includes("lion") ||
    t.includes("虎") ||
    t.includes("tiger") ||
    t.includes("狼") ||
    t.includes("wolf") ||
    t.includes("熊") ||
    t.includes("bear") ||
    t.includes("鳥") ||
    t.includes("bird") ||
    t.includes("鷹") ||
    t.includes("eagle") ||
    t.includes("馬") ||
    t.includes("horse") ||
    t.includes("animal") ||
    t.includes("zoology")
  ) {
    return {
      scholarlyTitleEn: "Comparative Mammalian Ethology & Apex Predator Biology: Systematic Field Inquiries",
      scholarlyTitleZh: "《頂級掠食者生態學與比較動物行為學專論》",
      professorName: "Prof. Charles Kingsley, Ph.D.",
      professorTitle: "Chair of Comparative Zoology · Royal Society Fellow",
      seriesName: "CAMBRIDGE YOUNG SCHOLAR ZOOLOGY SERIES",
      subfieldZh: "動物行為學與生物力學",
      visualSubjectEn: "A wild animal in natural wilderness habitat, wind through textured fur/feathers, piercing intense eyes, high-end National Geographic wildlife photography aesthetic",
      visualBackdropEn: "Anatomical muscle study sketches and geographic migration map",
    };
  }

  // 13. Plants & Botany
  if (
    t.includes("植物") ||
    t.includes("樹") ||
    t.includes("花") ||
    t.includes("森林") ||
    t.includes("botany") ||
    t.includes("flora") ||
    t.includes("forest") ||
    t.includes("plant") ||
    t.includes("flower") ||
    t.includes("tree")
  ) {
    return {
      scholarlyTitleEn: "Botanical Taxonomy & Cellular Ecology: Field Investigations of Flora",
      scholarlyTitleZh: "《維管植物分類與細胞生態學田野誌》",
      professorName: "Prof. Eleanor Hastings, Ph.D.",
      professorTitle: "Director of Botanical Research · Linnean Society Fellow",
      seriesName: "INTERNATIONAL BOTANICAL MONOGRAPH SERIES",
      subfieldZh: "植物分類學與細胞生態學",
      visualSubjectEn: "An exotic botanical flower specimen with intricate vein patterns, fresh dewdrops, rich deep emerald foliage, dramatic museum archive illumination",
      visualBackdropEn: "Microscopic cellular cross-section and botanical taxonomic drawing",
    };
  }

  // 14. Physics & Quantum Sciences
  if (
    t.includes("物理") ||
    t.includes("量子") ||
    t.includes("能量") ||
    t.includes("粒子") ||
    t.includes("physics") ||
    t.includes("quantum") ||
    t.includes("particle") ||
    t.includes("optics") ||
    t.includes("光學") ||
    t.includes("雷射") ||
    t.includes("laser")
  ) {
    return {
      scholarlyTitleEn: "Principles of Quantum Electrodynamics & Particle Physics: An Empirical Treatise",
      scholarlyTitleZh: "《量子電動力學與粒子物理學實證探究論》",
      professorName: "Prof. Robert Thornton, Ph.D.",
      professorTitle: "Department of Quantum Physics & Applied Optics · Senior Fellow",
      seriesName: "OXFORD MONOGRAPH IN FUNDAMENTAL PHYSICS",
      subfieldZh: "量子力學與高能物理",
      visualSubjectEn: "A glowing quantum particle chamber with intersecting laser beams, subatomic wave-particle diffraction rings, dark physics research laboratory aesthetic",
      visualBackdropEn: "Feynman quantum interaction diagram and mathematical field equations",
    };
  }

  // 15. Chemistry & Molecular Sciences
  if (
    t.includes("化學") ||
    t.includes("分子") ||
    t.includes("結晶") ||
    t.includes("礦物") ||
    t.includes("chemistry") ||
    t.includes("crystal") ||
    t.includes("mineral") ||
    t.includes("molecule") ||
    t.includes("element")
  ) {
    return {
      scholarlyTitleEn: "Molecular Crystallography & Synthetic Chemistry: Principles of Material Science",
      scholarlyTitleZh: "《分子結晶學與合成化學材料結構論》",
      professorName: "Prof. Victor Chen, Ph.D.",
      professorTitle: "Chair of Molecular Crystallography & Chemical Synthesis",
      seriesName: "MONOGRAPH IN ADVANCED MOLECULAR SCIENCES",
      subfieldZh: "分子結晶學與材料化學",
      visualSubjectEn: "A glowing crystalline mineral geode with sharp geometric facets, rainbow prismatic internal reflections, dark obsidian background with macro lighting",
      visualBackdropEn: "Crystallographic atomic lattice model and molecular bond structures",
    };
  }

  // Clean title formulation for general fallback
  const isChinese = /[\u4e00-\u9fa5]/.test(rawTopic);
  const capitalizedTopic = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1);

  return {
    scholarlyTitleEn: isChinese
      ? `Systematic Inquiries & Field Observations: ${author}'s Academic Monograph`
      : `Treatise on ${capitalizedTopic}: Systematic Inquiries & Empirical Field Observations`,
    scholarlyTitleZh: `《${rawTopic}：系統性專題研究與實證觀察論》`,
    professorName: "Prof. Alexander Vance, Ph.D.",
    professorTitle: "Senior Research Fellow · Academic Press Editorial Board",
    seriesName: "YOUNG SCHOLAR MONOGRAPH IN NATURAL & APPLIED SCIENCES",
    subfieldZh: `${rawTopic}專題探究`,
    visualSubjectEn: `A magnificent, hyper-detailed centerpiece subject showcasing ${rawTopic}, illuminated in dramatic cinematic studio chiaroscuro lighting, rich textures and fine craftsmanship on dark obsidian background`,
    visualBackdropEn: `Technical schematic blueprint and observational field documentation of ${rawTopic} on dark textured background`,
  };
}

export function deriveBookTopic(_theme: ThemeLike, interests: string): string {
  const profile = getScholarlyProfile(interests, "");
  return profile.scholarlyTitleEn;
}

export function buildPolishedBackBlurb(opts: {
  name: string;
  ageLine: string;
  theme: ThemeLike;
  interests: string;
  personality: string;
}): string {
  const profile = getScholarlyProfile(opts.interests, opts.name);
  const author = opts.name.trim() || "Young Scholar";

  return `【學術專著審定評語】\n本著作由青年學者 ${author} 執筆，特邀 ${profile.professorName}（${profile.professorTitle}）共同研討指導。\n全書收錄第一手實證觀測數據、精準科學圖鑑與系統化分析，展現卓越之學術探究熱情與跨領域研究潛力。正式收錄於 Kidsmybook 青年學者出版計劃，作為頂尖名校升學 Portfolio 權威專著。`;
}
