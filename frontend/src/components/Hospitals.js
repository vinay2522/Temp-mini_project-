import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaPhoneAlt, FaTimes } from 'react-icons/fa';

const HospitalCard = ({ image, name, location, contact, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center text-center cursor-pointer"
    onClick={onClick}
  >
    <img src={image} alt={name} className="w-full h-40 sm:h-48 object-cover mb-4 rounded-lg" />
    <h3 className="text-lg sm:text-xl font-semibold mb-2">{name}</h3>
    <p className="mb-2 text-sm sm:text-base">
      <FaMapMarkerAlt className="inline-block mr-2" />
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer">
        {location}
      </a>
    </p>
    <p className="text-sm sm:text-base">
      <FaPhoneAlt className="inline-block mr-2" />
      <a href={`tel:${contact}`}>{contact}</a>
    </p>
  </motion.div>
);

const HospitalDetails = ({ hospital, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-90vh overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <FaTimes size={24} />
      </button>
      <img src={hospital.image} alt={hospital.name} className="w-full h-48 object-cover mb-4 rounded-lg" />
      <h3 className="text-xl font-semibold mb-2">{hospital.name}</h3>
      <p className="mb-2 text-sm sm:text-base">
        <FaMapMarkerAlt className="inline-block mr-2" />
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.location)}`} target="_blank" rel="noopener noreferrer">
          {hospital.location}
        </a>
      </p>
      <p className="text-sm sm:text-base">
        <FaPhoneAlt className="inline-block mr-2" />
        <a href={`tel:${hospital.contact}`}>{hospital.contact}</a>
      </p>
    </div>
  </div>
);

const Hospitals = () => {
  const { t } = useTranslation();
  const [selectedHospital, setSelectedHospital] = useState(null);

  const hospitals = [
    {
      image: 'https://tse3.mm.bing.net/th?id=OIP.fmQsd22wqUn5tiBtSXORsAHaEH&pid=Api&P=0&h=180',
      name: 'Govenment hospital tumkur',
      location: 'District Hospital, Tumakuru ',
      contact: '8105498979'
    },
    {
      image: 'https://files.yappe.in/place/full/adarsha-nursing-home-6821236.webp',
      name: 'adarsha nursing home',
      location: 'Sharada Devi Nagar, opp. M G Stadium, Tumakuru, Karnataka 572103',
      contact: '8162272579'
    },
    {
      image: 'https://doctorlistingingestionpr.blob.core.windows.net/doctorprofilepic/1670556393552_HospitalProfileImage_ADITYA.PNG',
      name: 'aditya orthopeduc and trauma center',
      location: 'Bangalore - Honnavar Hwy, Sri Shivakumaraswamiji Circle, S.S.Puram, Tumakuru, Karnataka 572102',
      contact: '8162260023'
    },
    {
      image: 'https://files.yappe.in/place/full/akshara-eye-foundation-tumkur-2110912.webp',
      name: 'Akshara eye foundation',
      location: '84Q5+3RH Tumakuru, Karnataka, India',
      contact: '8162270469'
    },
    {
      image: 'https://doctorlistingingestionpr.blob.core.windows.net/doctorprofilepic/1663044576478_HospitalProfileImage_eaa5ffe7-1e3e-43de-8997-ab6070dccc43.png',
      name: 'aruna hospital',
      location: 'Dr Radhakrishnan Rd, S.S.Puram, Tumakuru, Karnataka 572102',
      contact: '8162276408'
    },
    {
      image: 'https://neetcounselling.org.in/wp-content/uploads/2024/07/Sri-Siddhartha-Medical-College-Hospital-Tumkur.webp',
      name: 'B siddaramanna hospital',
      location: 'Bhagwan Mahaveer Rd, Gandhi Nagar, Tumakuru, Karnataka 572102',
      contact: '8162270278'
    },
    {
      image: 'https://files.yappe.in/place/full/bapuji-nursing-home-6819103.webp',
      name: 'babuji nursing home',
      location: '1st Cross Rd, Coffee Board Colony, S.S.Puram, Tumakuru, Karnataka 572102, India',
      contact: '8162271628'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.EBssgVuJ_iU3I4N8otP0ugHaE8&pid=Api&P=0&h=180',
      name: 'bharti hospital',
      location: 'Opp NEPS, 2nd Cross, Bengaluru - Honnavar Road, Shankarapura, Tumakuru, Karnataka 572101',
      contact: '9845218253'
    },
    {
      image: 'https://tse3.mm.bing.net/th?id=OIP.4DOouBU1FzqJssIdPASWnwHaES&pid=Api&P=0&h=180',
      name: 'charaka hospital',
      location: 'S S Circle, S.S.Puram, Tumakuru, Karnataka 572103',
      contact: '9845588925'
    },
    {
      image: 'https://tse4.mm.bing.net/th?id=OIP.R37qdwxl3LWr9BtC7qrxNQHaD7&pid=Api&P=0&h=180',
      name: 'dr mahadevappa eye lazer hospital',
      location: '15th Cross Rd, S.S.Puram, Tumakuru, Karnataka 572102',
      contact: '9448402930'
    },
    {
      image: 'https://doctorlistingingestionpr.blob.core.windows.net/doctorprofilepic/1670556884080_HospitalProfileImage_6815ba2f-a266-4afd-a554-db06d07e0b75.png',
      name: 'dr tammaih hospital',
      location: '84V9+2QR, Stadium Road, Kuvempunagar, Venkatesh Rao Colony, Tumakuru, Karnataka 572103',
      contact: '8162274174'
    },
    {
      image: 'https://tse4.mm.bing.net/th?id=OIP.v1RntZrcn-XcH_nvnDxYbAAAAA&pid=Api&P=0&h=180',
      name: 'dr k narasimhaiah hospital',
      location: '4th Main Rd, near Police Station, Gandhi Nagar, Tumakuru, Karnataka 572101',
      contact: '9980352666'
    },
    {
      image: 'https://tse3.mm.bing.net/th?id=OIP.xhfiL3ag99TB9ZKnTqa3EgHaEK&pid=Api&P=0&h=180',
      name: 'Ganadhal ENT and dental hospital',
      location: '3rd Cross, Coffee Board Colony, S.S.Puram, Tumakuru, Karnataka 572101',
      contact: '9880911331'
    },
    {
      image: 'https://content.jdmagicbox.com/comp/ernakulam/30/0484p484std1200030/catalogue/gautham-hospital-kochi-ernakulam-hospitals-18k2ow2.jpg?clr=3f273f&interpolation=lanczos-none&output-format=jpg&resize=1024:370&crop=1024:370px;,',
      name: 'gowtam hospital',
      location: '84PC+5VJ Tumakuru, Karnataka',
      contact: '9448051518'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.MwXjrdlSavzHwvzeWBYmagHaHS&pid=Api&P=0&h=180',
      name: 'jayashree nursing home',
      location: 'K R extention, 1st Cross Road, near Nandi Hospital, Karnataka 572101',
      contact: '8162274747'
    },
    {
      image: 'https://www.bajajfinservhealth.in/_next/image?url=https:%2F%2Fdoctorlistingingestionpr.blob.core.windows.net%2Fdoctorprofilepic%2F1667377362546_HospitalProfileImage_dc91dd8b-ea0a-4780-ba34-7c16cfcb7d1f.png&w=3840&q=75',
      name: 'manipal tumkur hospital',
      location: '84R9+4M8 Tumakuru, Karnataka',
      contact: '9886550035'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.sBgDs0aNLP_rRX13OVh2TQHaIY&pid=Api&P=0&h=180',
      name: 'mukhambika modi hospital',
      location: '3rd Main Road, Bangalore - Honnavar Hwy, behind Doddamane hospital, Bengaluru, Tumakuru, Karnataka 572102',
      contact: '8162254400'
    },
    {
      image: 'https://tse3.mm.bing.net/th?id=OIP.Oe-OfCpgw__MrXLxzNnVdAHaJJ&pid=Api&P=0&h=180',
      name: 'nandi hospital',
      location: 'M.G Road, 1st Cross, K R Extension, Tumakuru, Karnataka 572102',
      contact: '7349199499'
    },
    {
      image: 'https://tse4.mm.bing.net/th?id=OIP.9xyi0iBnm5fcBmMi-o9kdQAAAA&pid=Api&P=0&h=180',
      name: 'survodaya hospital',
      location: '84P4+X7P Tumakuru, Karnataka, India',
      contact: '18003131414'
    },
    {
      image: 'https://sres.ac.in/images/hospital.jpg',
      name: 'doddamane hospital',
      location: 'Doddamane hospital building, Bangalore - Honnavar Hwy, Ward No. 18, Shankarpura, Tumakuru, Karnataka 572102',
      contact: '2048562555'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.iYPc84jpgK-ni1m5TIfIvwHaEA&pid=Api&P=0&h=180',
      name: 'hemavathi orthopedic nad trauma',
      location: '84P5+9H3 Tumakuru, Karnataka',
      contact: '8162277866'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.09Yu9Rhdu95-Q4Gt9kUXiAHaFn&pid=Api&P=0&h=180',
      name: 'vasan eye care',
      location: 'Vasan eye care hospital, No. 78/1/10, 14th cross, Dr Radhakrishnan Rd, S.S.Puram, Tumakuru, Karnataka 572102',
      contact: '9360946140'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.IIn88WUGrrqOeIWU7uVDgwHaFj&pid=Api&P=0&h=180',
      name: 'R P chest and super speciality hospital',
      location: '84Q7+H9C Tumakuru, Karnataka',
      contact: '2048562555'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.Rm7gr4JXcxG_By3k9aafuwHaEq&pid=Api&P=0&h=180',
      name: 'siddaganga hospital',
      location: '84Q7+2Q3 Tumakuru, Karnataka',
      contact: '8162602222'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.F09w5R_gHcE7dmQ2Zh1y_QHaES&pid=Api&P=0&h=180',
      name: 'Vinayaka hospital',
      location: '84P9+Q5V Tumakuru, Karnataka, India',
      contact: '8162254231'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.30y2zdhMwmLnzs5J_B_rIQHaB3&pid=Api&P=0&h=180',
      name: 'Mahesh surgical and maternity care',
      location: '2nd Cross, S S Circle, Ashok Nagar, Tumakuru, Karnataka 572102',
      contact: '9731377739'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.lPEE6NjYPcDjKJp4Yv_lJQHaHY&pid=Api&P=0&h=180',
      name: 'sri sai netgralaya',
      location: '83HV+GP9 Tumakuru, Karnataka, India',
      contact: '204852555'
    },
    {
      image: 'https://tse4.mm.bing.net/th?id=OIP.qZtW_LZKUGL8e_F_R5jsRAHaC9&pid=Api&P=0&h=180',
      name: 'sri devi insitute of medical and research',
      location: 'M G Road, 1st Cross Rd, K R Extension, Ward No. 18, Tumakuru, Karnataka 572101',
      contact: '8162211999'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.MUpPMYjNShgY_MVuYeeoRwHaEX&pid=Api&P=0&h=180',
      name: 'sukurtha IVF and orthopedic center',
      location: '848G+XQG Tumakuru, Karnataka',
      contact: '9449793266'
    },
    {
      image: 'https://tse2.mm.bing.net/th?id=OIP.wWQBFPG4XpXjn6MjLkquqQHaE7&pid=Api&P=0&h=180',
      name: 'we care multi speciality hospital',
      location: '94P8+372 Tumakuru, Karnataka',
      contact: '8884518889'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.3ZDf3qwASjnxE97tzCwaOgHaHa&pid=Api&P=0&h=180',
      name: 'chalukya hospital',		
      location: '8W6R+Q5G Gubbi, Karnataka',
      contact: '2048562555'
    },
    {
      image: 'https://tse4.mm.bing.net/th?id=OIP.e4_4rU0qlo2Zj2RVy7vVggHaE8&pid=Api&P=0&h=180',
      name: 'pragathi hospital',
      location: '84M5+4V9, Coffee Board Colony, S.S.Puram, Tumakuru, Karnataka 572102',
      contact: '8162273434'
    },
    {
      image: 'https://tse3.mm.bing.net/th?id=OIP.vBa5NPF-8jkVfMHxxXpvuQHaEM&pid=Api&P=0&h=180',
      name: 'shri vijaya nursing home',
      location: '84Q7+4RC Tumakuru, Karnataka',
      contact: '8134250267'
    }, {
      image: 'https://tse2.mm.bing.net/th?id=OIP.4Kqm8cLOIj69S9kPoMf-bgHaEO&pid=Api&P=0&h=180',
      name: 'shrinivas nursing home',
      location: '84Q8+3X7 Tumakuru, Karnataka, India',
      contact: '8162278136'
    }, {
      image: 'https://tse2.mm.bing.net/th?id=OIP.9uQVWYJNlS9xWU9_-82-PAHaE7&pid=Api&P=0&h=180',
      name: 'vijaya hospital',
      location: 'banashankari, Kunigal-Tumkur Rd, Tumakuru, Karnataka 572102',
      contact: '9162257762'
    }, {
      image: 'https://tse3.mm.bing.net/th?id=OIP.TzpR-5eJ20P2t5xU2Q0FsAHaG8&pid=Api&P=0&h=180',
      name: 'chaitanya hospital',
      location: 'N. Lingappa Complex, Railway Station Rd, beside Poorvika Mobiles Tumkur, Tumakuru, Karnataka 572101',
      contact: ''
    },
     {
      image: 'https://tse4.mm.bing.net/th?id=OIP.g1oGx8IEluecQSJ5GIDnhwHaDy&pid=Api&P=0&h=180',
      name: 'lakshmi narayana hospitals',
      location: 'Bestara Halli Rd, Y N Hosakote, Karnataka 572141',
      contact: '8136247622'
    }, {
      image: 'https://tse1.mm.bing.net/th?id=OIP.qfGNvsvtg8ZG2GCpJ34ergAAAA&pid=Api&P=0&h=180',
      name: 'shree sharadadevi eye hospital',
      location: '37RM+FC7 Pavagada, Karnataka',
      contact: '8136244716'
    }, {
      image: 'https://tse2.mm.bing.net/th?id=OIP.VckFL9Y0nieaZNaEcMSJLgAAAA&pid=Api&P=0&h=180',
      name: 'Hitech kidney stone hospital',
      location: '84Q5+RXW Tumakuru, Karnataka',
      contact: '8884444503'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.7jTL78GFlZV-iEqI5EqxigHaEK&pid=Api&P=0&h=180',
      name: 'kasturba hospital',
      location: '84J7+X69 Tumakuru, Karnataka',
      contact: '8164021011'
    }, {
      image: 'https://tse1.mm.bing.net/th?id=OIP.mi7mDwhFgnHSwSbZg7yTGQHaDy&pid=Api&P=0&h=180',
      name: 'indira IVF fertility cenetr',
      location: '84MF+R8X Tumakuru, Karnataka, India',
      contact: '9.12E+12'
    }, {
      image: 'https://tse1.mm.bing.net/th?id=OIP.X9n0hjcEsxGSet6tpKTrzQHaFj&pid=Api&P=0&h=180',
      name: 'sri manjunatha hospital',
      location: '848C+WG4 Tumakuru, Karnataka, India',
      contact: '7383797321'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.7-djLV0HG-_gzpPVWrPnZQHaDa&pid=Api&P=0&h=180',
      name: 'homeocare international private limited',
      location: ' ',
      contact: '7383817906'
    }, {
      image: 'https://tse1.mm.bing.net/th?id=OIP.m3AjyWSyBSIyEIoPZK8pTQHaEK&pid=Api&P=0&h=180',
      name: 'the super speciality hospital',
      location: 'Bangalore - Honnavar Hwy, near maruthi theater, B.G Palya Circle, Mandipet, Tumakuru, Karnataka 572102',
      contact: '8105325816'
    }, {
      image: 'https://tse4.mm.bing.net/th?id=OIP.aQFtzhNeEr4gfOgTsCEoVgHaFj&pid=Api&P=0&h=180',
      name: 'G S health care',
      location: '83JQ+477 Tumakuru, Karnataka',
      contact: '9.73E+12'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.s2q3gfiNYb5U4kzXOLeq2AHaD2&pid=Api&P=0&h=180',
      name: 'ganga hospital',
      location: '9492+WMJ, Sira Rd, Nagannanapalya, Antharasanahalli, Tumakuru, Karnataka 572106',
      contact: '9108944011'
    }, {
      image: 'https://tse3.mm.bing.net/th?id=OIP.PrYg4FmgPhzZtvo53fsugwHaFj&pid=Api&P=0&h=180',
      name: 'vignesh childern hospital',
      location: '94P8+9VR, Madhugiri Rd, opposite to omkar hotel, Yallapura, Tumakuru, Karnataka 572106',
      contact: '7947422604'
    }, {
      image: 'https://tse3.mm.bing.net/th?id=OIP.fSEhqjAkIYmfPrH17IU2WwHaHs&pid=Api&P=0&h=180',
      name: 'pavana hospital',
      location: 'Ward No. 18, Tumkur, Tumakuru, Karnataka 572101',
      contact: '8123768143'
    },
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.TuUPqxs9GYEfp8YIAxECPQHaHa&pid=Api&P=0&h=180',
      name: 'omaha ayurveda',
      location: '84R4+H4X Tumakuru, Karnataka, India',
      contact: ''
    }, {
      image: 'https://tse3.mm.bing.net/th?id=OIP.Zvzoki03ioRDe_h4ACeZ-QHaE7&pid=Api&P=0&h=180',
      name: 'kaveri hospital and kidney care center',
      location: '84P2+PWM Tumakuru, Karnataka, India',
      contact: '7383808152'
    }, 
    {
      image: 'https://tse1.mm.bing.net/th?id=OIP.0cGoalrBIAlETvrjAJjRAQAAAA&pid=Api&P=0&h=180',
      name: 'kavita ENT head and neck care',
      location: '84R2+CG5 Tumakuru, Karnataka, India',
      contact: '9886096987'
    },
    {
      image: 'https://tse3.mm.bing.net/th?id=OIP.vBa5NPF-8jkVfMHxxXpvuQHaEM&pid=Api&P=0&h=180',
      name: 'shree shaila nursing home',
      location: '83QV+XV7, Vinobha Nagar, P H Rich Colony, Tumakuru, Karnataka 572101',
      contact: '8162275709'
    }, {
      image: 'https://tse3.mm.bing.net/th?id=OIP.ajUrej_sYmsRzu8rIgN9EAAAAA&pid=Api&P=0&h=180',
      name: 'surya hospital',
      location: '84P9+X7P Tumakuru, Karnataka, India',
      contact: '8792548100'
    }, {
      image: 'https://tse4.mm.bing.net/th?id=OIP.HoxgCPBssEoGvf-fHXb7ZQAAAA&pid=Api&P=0&h=180',
      name: 'aditi multi speciality hospital',
      location: ' 84P9+X7P, Tumakuru, Karnataka',
      contact: '8277123000'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">{t('Hospitals')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {hospitals.map((hospital, index) => (
          <HospitalCard
            key={index}
            {...hospital}
            onClick={() => setSelectedHospital(hospital)}
          />
        ))}
      </div>
      {selectedHospital && (
        <HospitalDetails
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default Hospitals;