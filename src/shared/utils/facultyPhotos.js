// Utility for matching faculty photos by name and department

export const normalizeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "")
    .replace(/[^a-z0-9]/g, "");
};

export const FACULTY_PHOTOS = {
  // BSH
  "anaghramesh": "/Faculty Photos/BSH/Anagh Ramesh.jpg",
  "bincytj": "/Faculty Photos/BSH/Bincy T J.jpg",
  "dianamathew": "/Faculty Photos/BSH/Diana Mathew.jpg",
  "hingstonxavier": "/Faculty Photos/BSH/Hingston Xavier.jpeg",
  "keerthanakr": "/Faculty Photos/BSH/Keerthana K R.jpg",
  "midhuelizabeth": "/Faculty Photos/BSH/Midhu Elizabeth.jpg",
  "neethuk": "/Faculty Photos/BSH/Neethu K.jpg",
  "petcyanniemm": "/Faculty Photos/BSH/Petcy Annie M M.jpg",
  "reenacg": "/Faculty Photos/BSH/Reena C G.jpg",
  "reshmapb": "/Faculty Photos/BSH/Reshma P B.jpg",
  "revathygkrishnan": "/Faculty Photos/BSH/Revathy G Krishnan.jpg",
  "susenjose": "/Faculty Photos/BSH/Susen Jose.jpg",
  "vdjhon": "/Faculty Photos/BSH/VD John.jpg",
  "vdjohn": "/Faculty Photos/BSH/VD John.jpg",
  "vinayajose": "/Faculty Photos/BSH/Vinaya Jose.jpg",
  "vishnuk": "/Faculty Photos/BSH/Vishnu K.jpg",

  // Civil
  "abhishekpw": "/Faculty Photos/Civil/Abhishek P W.jpg",
  "angithasasidharan": "/Faculty Photos/Civil/Angitha Sasidharan.jpg",
  "bindurajan": "/Faculty Photos/Civil/Bindu Rajan.jpg",
  "godwinpa": "/Faculty Photos/Civil/Godwin P A.jpg",
  "jinojohn": "/Faculty Photos/Civil/Jino John.jpg",
  "melbyjoy": "/Faculty Photos/Civil/Melby Joy.jpg",
  "neenujohnson": "/Faculty Photos/Civil/Neenu Johnson.jpg",
  "prabhashankarvp": "/Faculty Photos/Civil/Prabhashankar V P.jpg",
  "prabhasankarvp": "/Faculty Photos/Civil/Prabhashankar V P.jpg",
  "riyajoseph": "/Faculty Photos/Civil/Riya Joseph.jpg",
  "sherjahpyousaf": "/Faculty Photos/Civil/Sherjah P Yousaf.jpg",
  "sherjahpyusuf": "/Faculty Photos/Civil/Sherjah P Yousaf.jpg",
  "shicyns": "/Faculty Photos/Civil/Shicy N S.jpg",
  "vinithaev": "/Faculty Photos/Civil/Vinitha E V.jpg",
  "vivekkviswanath": "/Faculty Photos/Civil/Vivek K Viswanath.jpg",

  // CSE
  "aiswaryasm": "/Faculty Photos/CSE/Aiswarya S M.jpg",
  "anmariya": "/Faculty Photos/CSE/Anmariya Wilson.jpg",
  "anmariyawilson": "/Faculty Photos/CSE/Anmariya Wilson.jpg",
  "annaalphy": "/Faculty Photos/CSE/Anna Alphy.jpeg",
  "athithyas": "/Faculty Photos/CSE/Athithya S.jpg",
  "bijyantony": "/Faculty Photos/CSE/Bijy Antony.jpg",
  "chaithanniats": "/Faculty Photos/CSE/Chaithannia T S.jpg",
  "dincyrarrikat": "/Faculty Photos/CSE/Dincy R Arrikat.jpg",
  "dincyrarikkat": "/Faculty Photos/CSE/Dincy R Arrikat.jpg",
  "divyar": "/Faculty Photos/CSE/Divya R.jpeg",
  "himajose": "/Faculty Photos/CSE/Hima Jose.jpg",
  "irisjose": "/Faculty Photos/CSE/Iris Jose.jpg",
  "jasminejolly": "/Faculty Photos/CSE/Jasmine Jolly.jpeg",
  "jibytc": "/Faculty Photos/CSE/Jiby T C.jpg",
  "jincydenny": "/Faculty Photos/CSE/Jincy Denny.jpg",
  "krishnapriyaps": "/Faculty Photos/CSE/Krishnapriya P S.jpg",
  "mariyaseby": "/Faculty Photos/CSE/Mariya Seby.jpg",
  "merrylmaryforbin": "/Faculty Photos/CSE/Merryl Mary Forbin.jpg",
  "monishathomas": "/Faculty Photos/CSE/Monisha Thomas.jpg",
  "neethupr": "/Faculty Photos/CSE/Neethu P R.jpg",
  "nithacvelayudhan": "/Faculty Photos/CSE/Nitha C Velayudhan.jpg",
  "prashantkbaby": "/Faculty Photos/CSE/Prasanth K Baby.jpg",
  "prasanthkbaby": "/Faculty Photos/CSE/Prasanth K Baby.jpg",
  "reshmakv": "/Faculty Photos/CSE/Reshma K V.jpg",
  "rinsuaravind": "/Faculty Photos/CSE/Rinsu Aravind.jpg",
  "sabiraps": "/Faculty Photos/CSE/Sabira P S.jpg",
  "salishplouis": "/Faculty Photos/CSE/Salish P Louis.jpg",
  "simmifrancis": "/Faculty Photos/CSE/Simmi Francis.jpg",
  "soorajtr": "/Faculty Photos/CSE/Sooraj T R.jpg",
  "sreethaes": "/Faculty Photos/CSE/Sreetha E S.jpg",
  "sunijose": "/Faculty Photos/CSE/Suni Jose.jpg",
  "vaishakckrishnan": "/Faculty Photos/CSE/Vaishak C Krishnan.jpg",
  "vineethakv": "/Faculty Photos/CSE/Vineetha K V.jpg",

  // ECE
  "ajeeshs": "/Faculty Photos/ECE/Ajeesh S.jpeg",
  "anittaantony": "/Faculty Photos/ECE/Anitta Antony.jpg",
  "carenbabu": "/Faculty Photos/ECE/Caren Babu.jpg",
  "catherinejnereveett": "/Faculty Photos/ECE/Catherine J Nereveett.jpeg",
  "catherinejnereveettil": "/Faculty Photos/ECE/Catherine J Nereveett.jpeg",
  "dellareasavaliaveet": "/Faculty Photos/ECE/Della Reasa Valiaveet.jpg",
  "dellareasavaliaveetil": "/Faculty Photos/ECE/Della Reasa Valiaveet.jpg",
  "krishnapriyas": "/Faculty Photos/ECE/Krishnapriya S.jpg",
  "manjuikollannur": "/Faculty Photos/ECE/Manju I Kollannur.jpg",
  "sangeethsomarajan": "/Faculty Photos/ECE/Sangeeth Somarajan.jpg",
  "sibinlalms": "/Faculty Photos/ECE/Sibinlal M S.jpg",
  "swathypm": "/Faculty Photos/ECE/Swathy P M.jpg",
  "vinojpg": "/Faculty Photos/ECE/Vinoj P G.jpg",
  "vinojpg": "/Faculty Photos/ECE/Vinoj P G.jpg",

  // EEE
  "aneeshku": "/Faculty Photos/EEE/Aneesh K U.jpg",
  "anjanasomasundaran": "/Faculty Photos/EEE/Anjana Somasundaran.jpg",
  "emilinthomas": "/Faculty Photos/EEE/Emilin Thomas.jpg",
  "emilinthomask": "/Faculty Photos/EEE/Emilin Thomas.jpg",
  "jinukt": "/Faculty Photos/EEE/Jinu K T.jpg",
  "needhuvarghese": "/Faculty Photos/EEE/Needhu Varghese.jpg",
  "nithinks": "/Faculty Photos/EEE/Nithin K S.jpg",
  "preethipi": "/Faculty Photos/EEE/Preethi P I.jpg",
  "preethiti": "/Faculty Photos/EEE/Preethi P I.jpg",
  "rarimm": "/Faculty Photos/EEE/Rari M M.jpg",
  "thakkupeter": "/Faculty Photos/EEE/Thakku Peter.jpg",
  "vipinpadmanaban": "/Faculty Photos/EEE/Vipin padmanaban.jpg",
  "vipinpadmanabhan": "/Faculty Photos/EEE/Vipin padmanaban.jpg",
  "vishnupm": "/Faculty Photos/EEE/Vishnu P M.jpg",

  // Main
  "johnpaliakara": "/Faculty Photos/Main/John Paliakara.jpg",
  "johnvd": "/Faculty Photos/Main/John V.D.jpg",
  "manojgeorge": "/Faculty Photos/Main/Manoj George.jpg",
  "milnerpaulv": "/Faculty Photos/Main/Milner Paul V.jpg",
  "sajeevjohn": "/Faculty Photos/Main/Sajeev John.jpg",
  "sijomt": "/Faculty Photos/Main/Sijo M T.jpg",

  // MBA
  "jhonmathew": "/Faculty Photos/MBA/Jhon Mathew.jpeg",
  "johnmathew": "/Faculty Photos/MBA/Jhon Mathew.jpeg",
  "kavyakb": "/Faculty Photos/MBA/Kavya K B.jpeg",
  "nivithapaul": "/Faculty Photos/MBA/Nivitha Paul.jpeg",
  "snehajhonp": "/Faculty Photos/MBA/Sneha Jhon P.jpeg",
  "snehajohnp": "/Faculty Photos/MBA/Sneha Jhon P.jpeg",
  "tintababy": "/Faculty Photos/MBA/Tinta Baby.jpeg",

  // Mech
  "aloshjames": "/Faculty Photos/Mech/Alosh James.jpg",
  "anexkp": "/Faculty Photos/Mech/Anex K P.jpg",
  "aswathypsajeev": "/Faculty Photos/Mech/Aswathy P Sajeev.jpg",
  "balakrishnancr": "/Faculty Photos/Mech/Balakrishnan C R.jpg",
  "bejoyjose": "/Faculty Photos/Mech/Bejoy Jose.jpg",
  "donydominic": "/Faculty Photos/Mech/Dony Dominic.jpg",
  "jackwinvincent": "/Faculty Photos/Mech/Jackwin Vincent.jpg",
  "jomonaj": "/Faculty Photos/Mech/Jomon A J.jpg",
  "joyet": "/Faculty Photos/Mech/Joy E T.jpg",
  "nithinvk": "/Faculty Photos/Mech/Nithin V K.jpg",
  "reynoldjose": "/Faculty Photos/Mech/Reynold Jose.jpg",
  "rojinmathew": "/Faculty Photos/Mech/Rojin Mathews.jpg",
  "rojinmathews": "/Faculty Photos/Mech/Rojin Mathews.jpg",
  "roshandavid": "/Faculty Photos/Mech/Roshan David.jpg",
  "sanjeshks": "/Faculty Photos/Mech/Sanjesh K S.jpg",
  "viswanathkkaimal": "/Faculty Photos/Mech/Viswanath K Kaimal.jpg"
};

export const getFacultyPhoto = (name, dept) => {
  if (!name) return null;
  const normalized = normalizeName(name);

  // Exact match in dictionary
  if (FACULTY_PHOTOS[normalized]) {
    return FACULTY_PHOTOS[normalized];
  }

  // Partial match check
  const keys = Object.keys(FACULTY_PHOTOS);
  for (const key of keys) {
    if (normalized.length >= 4 && (key.includes(normalized) || normalized.includes(key))) {
      return FACULTY_PHOTOS[key];
    }
  }

  // Department folder fallback construction
  if (dept) {
    let folder = dept.trim();
    if (folder.toLowerCase().includes('computer') || folder.toLowerCase().includes('cse')) folder = 'CSE';
    else if (folder.toLowerCase().includes('civil')) folder = 'Civil';
    else if (folder.toLowerCase().includes('electronics') || folder.toLowerCase().includes('ece')) folder = 'ECE';
    else if (folder.toLowerCase().includes('electrical') || folder.toLowerCase().includes('eee')) folder = 'EEE';
    else if (folder.toLowerCase().includes('mechanical') || folder.toLowerCase().includes('mech')) folder = 'Mech';
    else if (folder.toLowerCase().includes('basic') || folder.toLowerCase().includes('bsh') || folder.toLowerCase().includes('humanities')) folder = 'BSH';
    else if (folder.toLowerCase().includes('management') || folder.toLowerCase().includes('mba')) folder = 'MBA';
    
    const rawName = name.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, "").trim();
    return `/Faculty Photos/${folder}/${rawName}.jpg`;
  }

  return null;
};
