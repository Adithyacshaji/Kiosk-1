import { Sheet } from "react-modal-sheet";
import { formatRoomId } from "../../utils/formatRoomId";
import { memo, useState } from "react";
import ImageModal from "./ImageModal";
import { ChevronRight, School, Layers, TestTube, Car, Bath, Library, Users, Coffee, Navigation, User } from "lucide-react";

export const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/^(dr|mr|ms|mrs|prof|sr)\.?\s+/g, '')
    .replace(/[^a-z]/g, '');
};

export const formatFloor = (floor) => {
  if (!floor) return "Ground Floor";
  const f = String(floor).toUpperCase().trim();
  if (f === "G" || f === "0" || f === "GROUND" || f === "GROUND FLOOR") return "Ground Floor";
  if (f === "B1" || f === "BASEMENT1" || f === "BASEMENT 1") return "Basement 1";
  if (f === "B2" || f === "BASEMENT2" || f === "BASEMENT 2") return "Basement 2";
  if (f === "F1") return "1st Floor";
  if (f === "F2") return "2nd Floor";
  if (f === "F3") return "3rd Floor";
  if (f === "F4") return "4th Floor";
  if (f === "F5") return "5th Floor";
  const match = f.match(/\d+/);
  if (match) {
    const n = parseInt(match[0], 10);
    const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
    return `${n}${suffix} Floor`;
  }
  return `${floor}`;
};

export const formatBuilding = (building) => {
  const b = (building || "").toLowerCase();
  if (b.includes("chavara")) return "St Chavara Block";
  return "St Mary's Block";
};

export const FACULTY_PHOTOS = {
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
  "johnvd": "/Faculty Photos/Main/John V.D.jpg",
  "manojgeorge": "/Faculty Photos/Main/Manoj George.jpg",
  "sajeevjohn": "/Faculty Photos/Main/Sajeev John.jpg",
  "sijomt": "/Faculty Photos/Main/Sijo M T.jpg",
  "hingstonxavier": "/Faculty Photos/MBA/Hingston Xavier.jpeg",
  "jhonmathew": "/Faculty Photos/MBA/Jhon Mathew.jpeg",
  "johnmathew": "/Faculty Photos/MBA/Jhon Mathew.jpeg",
  "kavyakb": "/Faculty Photos/MBA/Kavya K B.jpeg",
  "nivithapaul": "/Faculty Photos/MBA/Nivitha Paul.jpeg",
  "snehajhonp": "/Faculty Photos/MBA/Sneha Jhon P.jpeg",
  "snehajohnp": "/Faculty Photos/MBA/Sneha Jhon P.jpeg",
  "tintababy": "/Faculty Photos/MBA/Tinta Baby.jpeg",
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

const getIcon = (title) => {
  switch (title.toLowerCase()) {
    case "departments":
    case "department":
    case "faculty":
      return <School size={24} />;
    case "buildings":
      return <School size={24} />;
    case "labs":
      return <TestTube size={24} />;
    case "cafeteria":
      return <Coffee size={24} />;
    case "library":
      return <Library size={24} />;
    default:
      return <School size={24} />;
  }
};

function BottomSheet({
  open,
  onClose,
  title,
  data,
  selectedDepartment,
  setSelectedDepartment,
  onNavigate,
  onSelectCategory,
  onLocateUser,
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  const renderDefaultExplore = () => (
    <div className="pt-3 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center justify-between mb-10 px-5">
        <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Explore Campus</h3>
        {/* <button className="text-[13px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
          View All <ChevronRight size={14} />
        </button> */}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { id: "departments", label: "Departments", count: "24", icon: School, color: "text-blue-600", bg: "bg-blue-50" },
          { id: "classrooms", label: "Classrooms", count: "120", icon: Layers, color: "text-green-600", bg: "bg-green-50" },
          { id: "labs", label: "Labs", count: "48", icon: TestTube, color: "text-purple-600", bg: "bg-purple-50" },
          { id: "parking", label: "Parking", count: "3 Zones", icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
          // { id: "washrooms", label: "Washrooms", count: "18", icon: Bath, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectCategory(item.id)}
            className="flex flex-col items-center justify-center bg-gray-50/50 border border-gray-100 rounded-2xl p-4 gap-4 hover:bg-white hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] hover:border-gray-200 transition-all text-center group cursor-pointer"
          >
            <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
              <item.icon size={30} className={item.color} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800 leading-tight">{item.label}</span>
              <span className="text-[11px] font-medium text-gray-500 mt-0.5">{item.count}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        {/* <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Popular Places</h3> */}
        {/* <button className="text-[13px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
          See All <ChevronRight size={14} />
        </button> */}
      </div>

      {/* <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 hide-scrollbar snap-x">
        {[
          { name: "Library", img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80", icon: Library, time: "2 min walk", color: "bg-purple-600" },
          { name: "St. Mary's Block", img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80", icon: School, time: "1 min walk", color: "bg-blue-600" },
          { name: "CSE Department", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=400&q=80", icon: Users, time: "3 min walk", color: "bg-green-600" },
          { name: "Canteen", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80", icon: Coffee, time: "2 min walk", color: "bg-orange-600" },
        ].map((place, idx) => (
          <div key={idx} className="w-40 shrink-0 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.04)] overflow-hidden snap-start cursor-pointer hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="h-22.5 w-full bg-gray-200 relative">
               <img src={place.img} alt={place.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 ${place.color} rounded flex items-center justify-center shrink-0`}>
                  <place.icon size={12} className="text-white" />
                </div>
                <h4 className="text-[13px] font-bold text-gray-900 truncate">{place.name}</h4>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Navigation size={12} />
                <span className="text-[11px] font-medium">{place.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );

  return (
    <>
    <Sheet isOpen={open} onClose={onClose}>
      <Sheet.Container className="rounded-t-[28px]! shadow-[0_-8px_40px_rgb(0,0,0,0.12)]!">
        <Sheet.Header />

        <Sheet.Content>
          <div className="px-5 py-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] flex flex-col h-full bg-white text-gray-900">
            {title && <h2 className="text-[22px] font-bold tracking-tight mb-5">{title}</h2>}

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-5 px-5 hide-scrollbar">
              {/* Fallback Explore Campus view if no specific data */}
              {!data && !title && renderDefaultExplore()}

              {/* Department List */}
              {Array.isArray(data) && title === "Faculty" && !selectedDepartment && data.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 mb-3 bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-[0_4px_16px_rgb(0,0,0,0.08)] transition-all" onClick={() => setSelectedDepartment(dept)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${dept.image_url ? 'border border-gray-200' : 'bg-blue-50 text-primary'}`}>
                      {dept.image_url ? (
                        <img src={dept.image_url} alt={dept.name} className="w-full h-full object-cover" />
                      ) : (
                        <School size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[16px] font-semibold text-gray-900 leading-tight mb-1">{dept.name}</h4>
                      <p className="text-[13px] text-gray-500">{dept.faculties.length} Faculty Members</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              ))}

              {/* Faculty List inside Department */}
              {selectedDepartment && (
                <div className="flex flex-col">
                  <button className="self-start text-[15px] font-semibold text-primary mb-4 flex items-center gap-1 hover:opacity-80" onClick={() => setSelectedDepartment(null)}>
                    ← Back
                  </button>
                  <h3 className="text-[18px] font-bold mb-4">{selectedDepartment.name}</h3>
                  {selectedDepartment.faculties.map((faculty, index) => {
                    const normalizedName = normalizeName(faculty.name);
                    const photoPath = faculty.image_url || FACULTY_PHOTOS[normalizedName];
                    const facultyBuilding = formatBuilding(faculty.building || faculty.routeNode);
                    const facultyFloor = formatFloor(faculty.floor);
                    const facultyRoom = formatRoomId(
                      (faculty.indoorNode && !faculty.indoorNode.includes(" ") && faculty.indoorNode !== faculty.building)
                        ? faculty.indoorNode
                        : (faculty.room && !faculty.room.toLowerCase().includes("block") ? faculty.room : (faculty.indoorNode || faculty.room))
                    );

                    return (
                      <div className="p-4 mb-3 bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col gap-1" key={index}>
                        <div className="flex items-center gap-4">
                          <div 
                            className={`w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden ${photoPath ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                            onClick={(e) => {
                              if (photoPath) {
                                e.stopPropagation();
                                setSelectedImage({ url: photoPath, alt: faculty.name });
                              }
                            }}
                          >
                            {photoPath ? (
                              <img 
                                src={photoPath} 
                                alt={faculty.name} 
                                className="w-full h-full object-cover object-center"
                              />
                            ) : (
                              <User size={24} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <h4 className="text-[16px] font-semibold text-gray-900 leading-tight">{faculty.name}</h4>
                            <p className="text-[14px] text-gray-600 mt-0.5">{faculty.designation}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">{facultyBuilding} · {facultyFloor}</p>
                            {facultyRoom && <span className="text-[12.5px] text-gray-500 mt-0.5">Room: {facultyRoom}</span>}
                          </div>
                        </div>
                      <button className="mt-2 h-10 w-full bg-blue-50 hover:bg-blue-100 text-primary font-semibold rounded-full transition-colors text-[14px]" onClick={() => {
                        const facultyLocation = {
                          id: faculty.indoorNode || faculty.room,
                          name: faculty.name,
                          type: "faculty",
                          designation: faculty.designation,
                          department: selectedDepartment.name,
                          room: faculty.room,
                          floor: faculty.floor,
                          building: faculty.building,
                          location: faculty.building,
                          routeNode: faculty.routeNode,
                          indoorNode: faculty.indoorNode,
                          hasIndoorNavigation: faculty.hasIndoorNavigation,
                        };
                        onNavigate(facultyLocation);
                        onClose();
                      }}>
                        Show Route
                      </button>
                    </div>
                  );})}
                </div>
              )}

              {/* Standard List (Departments, Buildings, Labs, Cafeteria, Library, Parking, Washrooms, Classrooms) */}
              {title !== "Faculty" && Array.isArray(data) && data
                .filter((item) => {
                  if (title === "Department" || title === "Departments") {
                    return !item.name?.toLowerCase().includes("administration");
                  }
                  return true;
                })
                .map((item, index) => {
                const isDept = (title === "Department" || title === "Departments");
                const destination = isDept
                  ? (item.indoorNode || item.routeNode ? item : (item.faculties?.find(f => f.designation?.toLowerCase() === 'hod') || item.faculties?.[0])) 
                  : null;
                const bldg = isDept ? formatBuilding(item.building || destination?.building || destination?.routeNode || (item.name?.toLowerCase().includes("chavara") ? "chavara" : "stmarys")) : null;
                const flr = isDept ? formatFloor(item.floor || destination?.floor) : null;
                const room = isDept ? formatRoomId((destination?.indoorNode && !destination?.indoorNode?.includes(" ")) ? destination.indoorNode : (item.room || (destination?.room && !destination?.room?.toLowerCase().includes("block") ? destination.room : destination?.indoorNode))) : null;

                return (
                  <div className="p-4 mb-3 bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col gap-2" key={item.id || index}>
                    {item.image_url && (
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-2">
                        <img src={item.image_url} alt={item.name || item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h4 className="text-[16px] font-semibold text-gray-900 leading-tight">{item.name || item.title}</h4>
                    {item.description && <p className="text-[13px] text-gray-600">{item.description}</p>}
                    {isDept && (
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <p className="text-[13.5px] font-medium text-gray-700">{bldg}</p>
                        <p className="text-[13px] text-gray-500">{flr}</p>
                        {room && <p className="text-[12.5px] text-gray-500">Room: {room}</p>}
                      </div>
                    )}
                    {!isDept && item.building && (
                      <p className="text-[13px] text-gray-500">{formatBuilding(item.building)} {item.floor ? `· ${formatFloor(item.floor)}` : ''}</p>
                    )}
                    {!isDept && item.room && <span className="text-[12px] text-gray-500">Room: {item.room}</span>}
                    <button className="mt-2 h-10 w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-colors shadow-[0_2px_8px_rgb(37,99,235,0.3)] text-[14px]" onClick={() => {
                      if (isDept) {
                        if (!destination) return;
                        onNavigate({
                          id: destination.indoorNode || destination.routeNode,
                          name: item.name,
                          type: "faculty",
                          category: "department",
                          department: item.name,
                          floor: destination.floor,
                          room: destination.room,
                          building: destination.building,
                          location: destination.building,
                          routeNode: destination.routeNode,
                          indoorNode: destination.indoorNode,
                          hasIndoorNavigation: destination.hasIndoorNavigation,
                        });
                      } else {
                        onNavigate(item);
                      }
                      onClose();
                    }}>
                      Show Route
                    </button>
                  </div>
                );
              })}

              {/* Single item display (e.g. non-array Library) */}
              {!Array.isArray(data) && data && (
                <div className="p-5 mb-4 bg-white rounded-3xl border border-gray-100 flex flex-col gap-2">
                  <h4 className="text-[18px] font-bold text-gray-900">{data.title || data.name}</h4>
                  <p className="text-[14px] text-gray-600 mb-3">{data.description}</p>
                  <button className="h-11.5 w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-colors shadow-[0_2px_8px_rgb(37,99,235,0.3)] text-[14px]" onClick={() => {
                    onNavigate(data);
                    onClose();
                  }}>
                    Start Navigation
                  </button>
                </div>
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop />
    </Sheet>
    <ImageModal 
      imageUrl={selectedImage?.url} 
      altText={selectedImage?.alt} 
      onClose={() => setSelectedImage(null)} 
    />
    </>
  );
}

export default memo(BottomSheet);