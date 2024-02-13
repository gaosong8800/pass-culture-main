import typing


CINEMA_PROVIDER_NAMES = [
    "CDSStocks",
    "BoostStocks",
    "CGRStocks",
    "EMSStocks",
]

ALLOCINE_PRODUCTS_PROVIDER_NAME = "Allocine Products"

PASS_CULTURE_STOCKS_FAKE_CLASS_NAME = "PCAPIStocks"
EMS_STOCKS_FAKE_CLASS_NAME = "EMSStocks"

# FIXME: (mageoffray, 16-05-2023)
# To delete few iterations after v240
INDIVIDUAL_OFFERS_API_FAKE_CLASS_NAME = "IndividualOffersPublicAPI"
INDIVIDUAL_OFFERS_API_PROVIDER_NAME = "Individual Offers public API"

TITELIVE_EPAGINE_PROVIDER_NAME = "TiteLive API Epagine"

TITELIVE_MUSIC_GENRES_BY_GTL_ID: dict[str, str] = {
    "00000000": "INCONNU",
    "01000000": "MUSIQUE_CLASSIQUE",
    "02000000": "JAZZ / BLUES",
    "03000000": "BANDES ORIGINALES",
    "04000000": "ELECTRO",
    "05000000": "POP",
    "06000000": "ROCK",
    "07000000": "METAL",
    "08000000": "ALTERNATIF",
    "09000000": "VARIETES",
    "10000000": "FUNK / SOUL / RNB / DISCO",
    "11000000": "RAP/ HIP HOP",
    "12000000": "REGGAE / RAGGA",
    "13000000": "MUSIQUE DU MONDE",
    "14000000": "COUNTRY / FOLK",
    "15000000": "VIDEOS MUSICALES",
    "16000000": "COMPILATIONS",
    "17000000": "AMBIANCE",
    "18000000": "ENFANTS",
    "19000000": "AUTRES",
}

TITELIVE_MUSIC_SUB_GENRES_BY_GTL_ID: dict[str, str] = {
    "00000000": "INCONNU",
    "01000000": "MUSIQUE_CLASSIQUE",
    "01010000": "MUSIQUE_ANCIENNE",
    "01020000": "MUSIQUE_DE_CHAMBRE",
    "01030000": "LITURGIE",
    "01040000": "MESSES-REQUIEMS-PASSIONS",
    "01050000": "MUSIQUE_BAROQUE",
    "01060000": "CLASSIQUE_SYMPHONIE",
    "01070000": "CLASSIQUE_CONCERTO",
    "01080000": "CLASSIQUE_SONATE",
    "01090000": "OPERA-OPERETTE-CHANT_LYRIQUE",
    "01100000": "BALLETS",
    "01110000": "CLASSIQUE_RECITALS",
    "01120000": "MUSIQUE_CONTEMPORAINE",
    "02000000": "JAZZ-BLUES",
    "02010000": "JAZZ",
    "02020000": "JAZZ_VOCAL",
    "02030000": "JAZZ_CONTEMPORAIN-COOL",
    "02040000": "JAZZ_ROCK-FUSION-FUNK",
    "02050000": "BLUES",
    "02060000": "GOSPEL",
    "02070000": "JAZZ_MANOUCHE",
    "03000000": "BANDES_ORIGINALES",
    "03010000": "MUSIQUE_DE_FILMS",
    "03020000": "MUSIQUE_DE_SERIES_TV-FEUILLETONS",
    "03030000": "MUSIQUE_DE_JEUX_VIDEO",
    "03040000": "COMEDIES_MUSICALES-SPECTACLES",
    "03050000": "BO_PROGRAMMES_POUR_ENFANTS",
    "03060000": "PUBLICITE-JINGLES",
    "04000000": "ELECTRO",
    "04010000": "MUSIQUE_ELECTRONIQUE",
    "04020000": "TECHNO",
    "04030000": "HOUSE_MUSIC",
    "04040000": "ELECTRO_FRANCOPHONE-FRENCH_TOUCH",
    "04050000": "LOUNGE",
    "04060000": "TRIP_HOP-DRUM_N_BASS",
    "04070000": "DANCE",
    "05000000": "POP",
    "05010000": "POP_INTERNATIONALE",
    "05020000": "POP_FRANCOPHONE",
    "05030000": "BRIT_POP",
    "05040000": "POP_60_S",
    "05050000": "NEW_WAVE",
    "05060000": "POP_RETRO_INTERNATIONALE",
    "05070000": "POP_RETRO_FRANCOPHONE",
    "05080000": "K_POP-J_POP",
    "05090000": "LATINO_POP",
    "06000000": "ROCK",
    "06010000": "ROCK_INTERNATIONAL",
    "06020000": "ROCK_FRANCOPHONE",
    "06030000": "ROCK_N_ROLL-ROCKABILLY-PSYCHOBILLY",
    "06040000": "ROCK_PSYCHEDELIQUE",
    "06050000": "PROG_ROCK",
    "07000000": "METAL",
    "07010000": "HARD_ROCK-HEAVY_METAL",
    "07020000": "METAL-FUSION",
    "07030000": "METAL-FUSION_FRANCOPHONE",
    "07040000": "DEATH-DOOM-THRASH-SPEED_METAL",
    "08000000": "ALTERNATIF",
    "08010000": "PUNK-HARDCORE",
    "08020000": "PUNK-HARDCORE_FRANCOPHONE",
    "08030000": "ROCK_INDEPENDANT",
    "08040000": "ROCK_INDEPENDANT_FRANCOPHONE",
    "08050000": "GOTHIQUE",
    "08060000": "INDUSTRIEL-POST-INDUSTRIEL",
    "08070000": "GRUNGE",
    "08080000": "MUSIQUE_EXPERIMENTALE",
    "09000000": "VARIETES",
    "09010000": "VARIETE_INTERNATIONALE",
    "09020000": "VARIETE_FRANCOPHONE",
    "09030000": "VARIETE_RETRO_INTERNATIONALE",
    "09040000": "VARIETE_RETRO_FRANCOPHONE",
    "09050000": "CROONERS",
    "09060000": "VARIETE_EUROPEENNE",
    "10000000": "FUNK-SOUL-RNB-DISCO",
    "10010000": "SOUL_INTERNATIONAL",
    "10020000": "SOUL_FRANCOPHONE",
    "10030000": "FUNK_INTERNATIONAL",
    "10040000": "FUNK_FRANCOPHONE",
    "10050000": "AFROBEAT",
    "10060000": "RNB_INTERNATIONAL",
    "10070000": "RNB_FRANCOPHONE",
    "10080000": "DISCO",
    "10090000": "EURODISCO",
    "11000000": "RAP-HIP_HOP",
    "11010000": "OLD_SCHOOL_RAP",
    "11020000": "RAP-HIP_HOP_AMERICAIN",
    "11030000": "RAP-HIP_HOP_INTERNATIONAL",
    "11040000": "RAP-HIP_HOP_FRANCOPHONE",
    "11050000": "RAP_INSTRUMENTAL-DJING",
    "12000000": "REGGAE-RAGGA",
    "12010000": "ROOTS_REGGAE",
    "12020000": "REGGAE_INTERNATIONAL",
    "12030000": "REGGAE_FRANCOPHONE",
    "12040000": "DUB",
    "12050000": "SKA-ROCKSTEADY",
    "12060000": "DANCEHALL",
    "13000000": "MUSIQUE_DU_MONDE",
    "13010000": "MONDE_EUROPE_EST-OUEST",
    "13020000": "MONDE_AFRIQUE_DU_NORD-MOYEN_ORIENT",
    "13030000": "MONDE_AFRIQUE",
    "13040000": "MONDE_CARAÏBES",
    "13050000": "MONDE_AMERIQUE_DU_NORD",
    "13060000": "MONDE_AMERIQUE_CENTRALE-LATINE",
    "13070000": "MONDE_ASIE-OCEANIE",
    "13080000": "WORLD_FUSION",
    "13090000": "MUSIQUE_CELTIQUE",
    "13100000": "AFRO-CUBAN",
    "13110000": "DANSES",
    "14000000": "COUNTRY-FOLK",
    "14010000": "COUNTRY",
    "14020000": "ALTERNATIVE_COUNTRY-AMERICANA",
    "14030000": "FOLK_INTERNATIONAL",
    "14040000": "FOLK_FRANCOPHONE",
    "14050000": "BLUEGRASS",
    "15000000": "VIDEOS_MUSICALES",
    "15010000": "VIDEOS_CLASSIQUE-CONCERTS-OPERAS-BALLETS",
    "15020000": "VIDEOS_POP-ROCK-VARIETES",
    "15030000": "VIDEOS_METAL",
    "15040000": "VIDEOS_JAZZ-BLUES",
    "15050000": "VIDEOS_FUNK-SOUL-RNB",
    "15060000": "VIDEOS_RAP",
    "15070000": "VIDEOS_REGGAE-SKA-DUB",
    "15080000": "VIDEOS_ELECTRO",
    "15090000": "VIDEOS_MUSIQUE_DU_MONDE",
    "15100000": "VIDEOS_MUSICALES_ENFANTS",
    "15110000": "VIDEOS_DIVERS",
    "15120000": "VIDEOS_DOCUMENTAIRES_MUSICAUX",
    "16000000": "COMPILATIONS",
    "16010000": "COMPILATIONS_HITS-TOPS",
    "16020000": "COMPILATIONS_POP",
    "16030000": "COMPILATIONS_ROCK",
    "16040000": "COMPILATIONS_VARIETE_FRANCOPHONE",
    "16050000": "COMPILATIONS_VARIETE_INTERNATIONALE",
    "16060000": "COMPILATIONS_JAZZ-BLUES",
    "16070000": "COMPILATIONS_FUNK-SOUL-RNB",
    "16080000": "COMPILATIONS_RAP",
    "16090000": "COMPILATIONS_REGGAE-SKA-DUB",
    "16100000": "COMPILATIONS_ELECTRO",
    "16110000": "COMPILATIONS_MUSIQUE_DU_MONDE",
    "16120000": "COMPILATIONS_ENFANTS",
    "17000000": "AMBIANCE",
    "17010000": "NEW_AGE-AMBIENT",
    "17020000": "RELAXATION-YOGA-MEDITATION",
    "17030000": "SPORT-AEROBIC-ZUMBA",
    "17040000": "MUSETTE-ACCORDEON",
    "17050000": "CHANSONS_PAILLARDES",
    "17060000": "MUSIQUE_DE_NOEL",
    "17070000": "MUSIQUE_POUR_FETES_ET_ANNIVERSAIRES",
    "17080000": "HYMNES_MILITAIRES-NATIONAUX-VENERIE",
    "17090000": "AMBIANCE_NATURE_ET_ANIMAUX",
    "17100000": "AMBIANCE_BRUITAGES",
    "17110000": "AMBIANCE_INSTRUMENTAL",
    "17120000": "KARAOKE",
    "18000000": "ENFANTS",
    "18010000": "CONTES-RONDES-BERCEUSES",
    "18020000": "CHANSONS-KARAOKE_POUR_ENFANTS",
    "18030000": "ENFANTS_EDUCATIF",
    "18040000": "DIVERS_ENFANTS",
    "19000000": "DIVERS",
    "19010000": "LIVRES_LUS",
    "19020000": "THEATRE-AUDIOVISUEL",
    "19030000": "DIVERS_HUMOUR",
    "19040000": "DIVERS_EDUCATIF",
    "19050000": "DIVERS_METHODE",
    "19060000": "DOCUMENTS_SONORES-HISTORIQUE",
    "19070000": "INCLASSABLES",
}

GTL_IDS_BY_MUSIC_GENRE_CODE: dict[int, str] = {
    501: "02010000",
    520: "02050000",
    530: "12000000",
    600: "01000000",
    700: "13000000",
    800: "05000000",
    820: "06000000",
    840: "07000000",
    850: "08010000",
    860: "14000000",
    870: "14000000",
    880: "04000000",
    900: "11000000",
    930: "02060000",
    1000: "09000000",
    -1: "19000000",
}

MUSIC_SLUG_BY_GTL_ID: dict[str, str] = {
    "01000000": "CLASSIQUE-OTHER",
    "01010000": "CLASSIQUE-MEDIEVALE",
    "01020000": "CLASSIQUE-OTHER",
    "01030000": "CLASSIQUE-OTHER",
    "01040000": "CLASSIQUE-OTHER",
    "01050000": "CLASSIQUE-BAROQUE",
    "01060000": "CLASSIQUE-OTHER",
    "01070000": "CLASSIQUE-OTHER",
    "01080000": "CLASSIQUE-OTHER",
    "01090000": "CLASSIQUE-OPERA",
    "01100000": "CLASSIQUE-OTHER",
    "01110000": "CLASSIQUE-CHANT",
    "01120000": "CLASSIQUE-CONTEMPORAIN",
    "02000000": "JAZZ-OTHER",
    "02010000": "JAZZ-TRADITIONEL",
    "02020000": "JAZZ-VOCAL_JAZZ",
    "02030000": "JAZZ-JAZZ_CONTEMPORAIN",
    "02040000": "JAZZ-FUSION",
    "02050000": "BLUES-BLUES_ROCK",
    "02060000": "GOSPEL-TRADITIONAL_GOSPEL",
    "02070000": "JAZZ-MANOUCHE",
    "03000000": "OTHER",
    "04000000": "ELECTRO-OTHER",
    "04010000": "ELECTRO-ELECTRONICA",
    "04020000": "ELECTRO-TECHNO",
    "04030000": "ELECTRO-HOUSE",
    "04040000": "ELECTRO-OTHER",
    "04050000": "ELECTRO-LOUNGE",
    "04060000": "ELECTRO-DRUM_AND_BASS",
    "04070000": "ELECTRO-DANCE",
    "05000000": "POP-OTHER",
    "05010000": "POP-POP_ROCK",
    "05020000": "POP-OTHER",
    "05030000": "POP-BRITPOP",
    "05040000": "POP-OTHER",
    "05050000": "POP-ELECTRO_POP",
    "05060000": "POP-OTHER",
    "05070000": "POP-OTHER",
    "05080000": "POP-K_POP",
    "05090000": "POP-OTHER",
    "06000000": "ROCK-OTHER",
    "06010000": "ROCK-ARENA_ROCK",
    "06030000": "ROCK-ROCK_N_ROLL",
    "06040000": "ROCK-PSYCHEDELIC",
    "06050000": "ROCK-PROG_ROCK",
    "07000000": "METAL-OTHER",
    "07010000": "METAL-BLACK_METAL",
    "07020000": "METAL-FUSION",
    "07030000": "METAL-FUSION",
    "07040000": "METAL-DEATH_METAL",
    "08000000": "PUNK-OTHER",
    "08010000": "PUNK-HARDCORE_PUNK",
    "08020000": "PUNK-HARDCORE_PUNK",
    "08030000": "ROCK-INDIE_ROCK",
    "08040000": "ROCK-INDIE_ROCK",
    "08050000": "METAL-GOTHIC",
    "08060000": "METAL-METAL_INDUSTRIEL",
    "08070000": "ROCK-GRUNGE",
    "08080000": "ROCK-EXPERIMENTAL",
    "09000000": "CHANSON_VARIETE-OTHER",
    "09010000": "CHANSON_VARIETE-CHANSON_À_TEXTE",
    "09020000": "CHANSON_VARIETE-CHANSON_FRANCAISE",
    "09030000": "CHANSON_VARIETE-MUSIC_HALL",
    "09040000": "CHANSON_VARIETE-FOLKLORE_FRANCAIS",
    "09050000": "CHANSON_VARIETE-CHANSON_À_TEXTE",
    "09060000": "CHANSON_VARIETE-CHANSON_À_TEXTE",
    "10000000": "HIP_HOP_RAP-SOUL",
    "10010000": "HIP_HOP_RAP-SOUL",
    "10020000": "HIP_HOP_RAP-SOUL",
    "10030000": "HIP_HOP_RAP-FUNK",
    "10040000": "HIP_HOP_RAP-FUNK",
    "10050000": "MUSIQUE_DU_MONDE-AFRO_BEAT",
    "10060000": "HIP_HOP_RAP-R&B_CONTEMPORAIN",
    "10070000": "HIP_HOP_RAP-R&B_CONTEMPORAIN",
    "10080000": "HIP_HOP_RAP-DISCO",
    "10090000": "HIP_HOP_RAP-DISCO",
    "11000000": "HIP_HOP_RAP-OTHER",
    "11010000": "HIP_HOP_RAP-RAP_OLD_SCHOOL",
    "11020000": "HIP_HOP_RAP-HIP_HOP",
    "11030000": "HIP_HOP_RAP-HIP_HOP",
    "11040000": "HIP_HOP_RAP-RAP_FRANCAIS",
    "11050000": "HIP_HOP_RAP-OTHER",
    "12000000": "REGGAE-ROOTS",
    "12010000": "REGGAE-ROOTS",
    "12020000": "REGGAE-ROOTS",
    "12030000": "REGGAE-ZOUK",
    "12040000": "REGGAE-DUB",
    "12050000": "REGGAE-SKA",
    "12060000": "REGGAE-DANCEHALL",
    "13000000": "MUSIQUE_DU_MONDE-OTHER",
    "13010000": "MUSIQUE_DU_MONDE-OTHER",
    "13020000": "MUSIQUE_DU_MONDE-MOYEN_ORIENT",
    "13030000": "MUSIQUE_DU_MONDE-AFRICAINE",
    "13040000": "MUSIQUE_DU_MONDE-CARIBEENNE",
    "13050000": "MUSIQUE_DU_MONDE-AMERIQUE_DU_NORD",
    "13060000": "MUSIQUE_DU_MONDE-AMERIQUE_DU_SUD",
    "13070000": "MUSIQUE_DU_MONDE-ASIATIQUE",
    "13080000": "MUSIQUE_DU_MONDE-ALTERNATIVO",
    "13090000": "MUSIQUE_DU_MONDE-CELTIQUE",
    "13100000": "MUSIQUE_DU_MONDE-POP_LATINO",
    "13110000": "MUSIQUE_DU_MONDE-SALSA",
    "14000000": "COUNTRY-OTHER",
    "14010000": "COUNTRY-AMERICANA",
    "14020000": "COUNTRY-COUNTRY_ALTERNATIVE",
    "14030000": "FOLK-FOLK_ROCK",
    "14040000": "FOLK-FOLK_ROCK",
    "14050000": "COUNTRY-BLUEGRASS",
    "15000000": "OTHER",
    "16000000": "OTHER",
    "16020000": "POP-OTHER",
    "16030000": "ROCK-OTHER",
    "16040000": "CHANSON_VARIETE-CHANSON_FRANCAISE",
    "16050000": "POP-OTHER",
    "16060000": "JAZZ-OTHER",
    "16070000": "HIP_HOP_RAP-OTHER",
    "16080000": "HIP_HOP_RAP-OTHER",
    "16090000": "REGGAE-OTHER",
    "16100000": "ELECTRO-OTHER",
    "16110000": "MUSIQUE_DU_MONDE-OTHER",
    "17000000": "OTHER",
    "17040000": "CHANSON_VARIETE-FOLKLORE_FRANCAIS",
    "17050000": "CHANSON_VARIETE-FOLKLORE_FRANCAIS",
    "17080000": "CHANSON_VARIETE-FOLKLORE_FRANCAIS",
    "18000000": "OTHER",
    "18010000": "CHANSON_VARIETE-FOLKLORE_FRANCAIS",
    "19000000": "OTHER",
}


class TiteliveMusicSupport(typing.TypedDict):
    codesupport: str
    libelle: str
    is_allowed: bool


TITELIVE_MUSIC_SUPPORTS: list[TiteliveMusicSupport] = [
    {"codesupport": "0", "libelle": "REFERENCE INTERNE", "is_allowed": False},
    {"codesupport": "1", "libelle": "MULTI SUPPORT", "is_allowed": False},
    {"codesupport": "2", "libelle": "45 TOURS", "is_allowed": True},
    {"codesupport": "3", "libelle": "45 TOURS", "is_allowed": True},
    {"codesupport": "4", "libelle": "MAXI 45 TOURS", "is_allowed": True},
    {"codesupport": "5", "libelle": "33 TOURS", "is_allowed": True},
    {"codesupport": "6", "libelle": "33 TOURS", "is_allowed": True},
    {"codesupport": "7", "libelle": "33 TOURS", "is_allowed": True},
    {"codesupport": "8", "libelle": "CD SINGLE", "is_allowed": True},
    {"codesupport": "9", "libelle": "CD SINGLE", "is_allowed": True},
    {"codesupport": "10", "libelle": "MAXI SINGLE", "is_allowed": True},
    {"codesupport": "11", "libelle": "CD", "is_allowed": True},
    {"codesupport": "12", "libelle": "K7 SINGLE", "is_allowed": True},
    {"codesupport": "13", "libelle": "K7 SINGLE", "is_allowed": True},
    {"codesupport": "14", "libelle": "K7", "is_allowed": True},
    {"codesupport": "15", "libelle": "DOUBLE K7", "is_allowed": True},
    {"codesupport": "16", "libelle": "DCC", "is_allowed": False},
    {"codesupport": "17", "libelle": "MINI DISQUE", "is_allowed": False},
    {"codesupport": "18", "libelle": "VHS MUSICAL", "is_allowed": False},
    {"codesupport": "19", "libelle": "CD VIDEO", "is_allowed": False},
    {"codesupport": "20", "libelle": "CDI", "is_allowed": False},
    {"codesupport": "21", "libelle": "DVD MUSICAL", "is_allowed": True},
    {"codesupport": "22", "libelle": "CDROM", "is_allowed": False},
    {"codesupport": "23", "libelle": "DIVERS", "is_allowed": False},
    {"codesupport": "24", "libelle": "PLV", "is_allowed": False},
    {"codesupport": "25", "libelle": "JEU", "is_allowed": False},
    {"codesupport": "26", "libelle": "CLE USB / 512 MO", "is_allowed": False},
    {"codesupport": "27", "libelle": "LECTEUR MP3 / 512 MO", "is_allowed": False},
    {"codesupport": "28", "libelle": "NINTENDO WII", "is_allowed": False},
    {"codesupport": "29", "libelle": "BLU-RAY DISC (BD)", "is_allowed": True},
    {"codesupport": "30", "libelle": "DVD-HD", "is_allowed": False},
    {"codesupport": "31", "libelle": "TEE SHIRT", "is_allowed": False},
    {"codesupport": "32", "libelle": "MERCHANDISING", "is_allowed": False},
    {"codesupport": "33", "libelle": "GOODIES MULTIMEDIA", "is_allowed": False},
    {"codesupport": "34", "libelle": "CD MULTIMEDIA", "is_allowed": True},
    {"codesupport": "35", "libelle": "NINTENDO DS", "is_allowed": False},
    {"codesupport": "36", "libelle": "SACD", "is_allowed": True},
    {"codesupport": "37", "libelle": "MAXI SINGLE MULTIMEDIA", "is_allowed": False},
    {"codesupport": "38", "libelle": "CD DIGIPACK", "is_allowed": True},
    {"codesupport": "39", "libelle": "GAMEBOY ADVANCE", "is_allowed": False},
    {"codesupport": "40", "libelle": "FICHIER TELECHARGEABLE", "is_allowed": False},
    {"codesupport": "41", "libelle": "DVD VIDEO (CRYSTAL) MUSICAL", "is_allowed": False},
    {"codesupport": "42", "libelle": "CD MAXI + DVD (DUALDISC)", "is_allowed": False},
    {"codesupport": "43", "libelle": "CD + DVD (DUALDISC)", "is_allowed": True},
    {"codesupport": "44", "libelle": "NINTENDO WII U", "is_allowed": False},
    {"codesupport": "45", "libelle": "SONY PLAYSTATION 4", "is_allowed": False},
    {"codesupport": "46", "libelle": "SONY PLAYSTATION 2", "is_allowed": False},
    {"codesupport": "47", "libelle": "UMD MUSICAL", "is_allowed": False},
    {"codesupport": "48", "libelle": "UMD FILM", "is_allowed": False},
    {"codesupport": "49", "libelle": "VHS False MUSICAL", "is_allowed": False},
    {"codesupport": "50", "libelle": "BLU-RAY DISC (BD)", "is_allowed": True},
    {"codesupport": "51", "libelle": "DVD-HD", "is_allowed": False},
    {"codesupport": "52", "libelle": "SONY PLAYSTATION 3", "is_allowed": False},
    {"codesupport": "53", "libelle": "SONY PSP", "is_allowed": False},
    {"codesupport": "54", "libelle": "MICROSOFT XBOX", "is_allowed": False},
    {"codesupport": "55", "libelle": "MICROSOFT XBOX360", "is_allowed": False},
    {"codesupport": "56", "libelle": "PC & MAC", "is_allowed": False},
    {"codesupport": "57", "libelle": "PC (WINDOWS)", "is_allowed": False},
    {"codesupport": "58", "libelle": "MAC", "is_allowed": False},
    {"codesupport": "59", "libelle": "NINTENDO 3DS", "is_allowed": False},
    {"codesupport": "60", "libelle": "SONY PS VITA", "is_allowed": False},
    {"codesupport": "61", "libelle": "CD + LIVRE", "is_allowed": True},
    {"codesupport": "62", "libelle": "MICROSOFT XBOX ONE", "is_allowed": False},
    {"codesupport": "63", "libelle": "MAXI K7 + LIVRE", "is_allowed": False},
    {"codesupport": "64", "libelle": "BLOG SONG", "is_allowed": False},
    {"codesupport": "65", "libelle": "EPK", "is_allowed": False},
    {"codesupport": "66", "libelle": "SPOT PUB", "is_allowed": False},
    {"codesupport": "67", "libelle": "MAKING OF", "is_allowed": False},
    {"codesupport": "68", "libelle": "CONSOLE RETRO", "is_allowed": False},
    {"codesupport": "69", "libelle": "SONY PLAYSTATION 5", "is_allowed": False},
    {"codesupport": "70", "libelle": "NINTENDO SWITCH", "is_allowed": False},
    {"codesupport": "71", "libelle": "MICROSOFT XBOX SERIES", "is_allowed": False},
    {"codesupport": "74", "libelle": "MINI CD", "is_allowed": True},
    {"codesupport": "75", "libelle": "VINYL", "is_allowed": True},
    {"codesupport": "76", "libelle": "CD BOX", "is_allowed": True},
    {"codesupport": "77", "libelle": "CD SINGLE", "is_allowed": False},
    {"codesupport": "78", "libelle": "DOUBLE VINYL", "is_allowed": True},
    {"codesupport": "79", "libelle": "CD", "is_allowed": False},
    {"codesupport": "80", "libelle": "CD SINGLE", "is_allowed": False},
    {"codesupport": "81", "libelle": "33 TOURS / SINGLE", "is_allowed": True},
    {"codesupport": "83", "libelle": "TRIPLE VINYL", "is_allowed": True},
    {"codesupport": "86", "libelle": "SAMPLER CLIP", "is_allowed": False},
    {"codesupport": "87", "libelle": "SAMPLER SINGLES", "is_allowed": False},
    {"codesupport": "88", "libelle": "SAMPLER ALBUMS", "is_allowed": False},
    {"codesupport": "89", "libelle": "DVD False MUSICAL", "is_allowed": False},
    {"codesupport": "90", "libelle": "K7", "is_allowed": False},
    {"codesupport": "91", "libelle": "DVD AUDIO", "is_allowed": False},
    {"codesupport": "92", "libelle": "DVD VIDEO SINGLE", "is_allowed": False},
    {"codesupport": "93", "libelle": "DVD VIDEO ALBUM", "is_allowed": False},
    {"codesupport": "94", "libelle": "BLU-RAY DISC 3D", "is_allowed": False},
    {"codesupport": "96", "libelle": "CD AUDIO + DVD", "is_allowed": True},
    {"codesupport": "97", "libelle": "CD AUDIO + DVD", "is_allowed": True},
    {"codesupport": "98", "libelle": "CD MAXI + VIDEO", "is_allowed": False},
    {"codesupport": "99", "libelle": "SAMPLER", "is_allowed": False},
    {"codesupport": "100", "libelle": "BLU-RAY AUDIO", "is_allowed": True},
    {"codesupport": "101", "libelle": "LISEUSES", "is_allowed": False},
    {"codesupport": "102", "libelle": "CD AUDIO + BR (package CD)", "is_allowed": True},
    {"codesupport": "103", "libelle": "CD AUDIO + BR (package BR)", "is_allowed": True},
    {"codesupport": "104", "libelle": "CD AUDIO + BR 3D (package CD)", "is_allowed": False},
    {"codesupport": "105", "libelle": "CD AUDIO + BR 3D (package BR)", "is_allowed": False},
    {"codesupport": "106", "libelle": "GOOGLE STADIA", "is_allowed": False},
    {"codesupport": "107", "libelle": "ACCESSOIRES", "is_allowed": False},
]
TITELIVE_MUSIC_SUPPORTS_BY_CODE = {support["codesupport"]: support for support in TITELIVE_MUSIC_SUPPORTS}
NOT_CD_LIBELLES = ["TOURS", "VINYL", "K7"]
