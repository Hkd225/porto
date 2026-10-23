/**
 * Certificate archive.
 *
 * Transcribed directly from the original PDFs (42 files → 40 unique; two
 * byte-identical duplicates were hashed out). Every title, issuer, date and
 * verification code below is printed on the document itself — nothing
 * estimated, nothing embellished. Plates are page-1 renders under
 * /certificates, produced by scripts/cert-render.cjs from the same documents.
 */

export interface Certificate {
  /** Plate file under /certificates, rendered from the original PDF. */
  src: string;
  /** Course or programme title, as printed on the document. */
  title: string;
  /** Issuing body, as printed (platform first, academy named). */
  issuer: string;
  /** Issue month as printed, normalised to English. */
  date: string;
  /** Descending sort key: year × 100 + month. */
  sort: number;
  /** Public verification URL carried by the document. */
  verify?: string;
  /** Printed certificate number where the document carries no URL. */
  ref?: string;
}

/** Newest first — the registry reads like the record it is. */
export const certificates: Certificate[] = [
  {
    src: '/certificates/cert-11.jpg',
    title: 'Membangun Aplikasi Gen AI dengan Microsoft Azure',
    issuer: 'Dicoding',
    date: 'Sep 2026',
    sort: 202609,
    verify: 'https://dicoding.com/certificates/4EXGJK2NEXRL',
  },
  {
    src: '/certificates/cert-12.jpg',
    title: 'Belajar Penerapan Data Science dengan Microsoft Fabric',
    issuer: 'Dicoding',
    date: 'Sep 2026',
    sort: 202609,
    verify: 'https://dicoding.com/certificates/RVZKM8QKNXD5',
  },
  {
    src: '/certificates/cert-02.jpg',
    title: 'GCI World April 2026',
    issuer: 'Matsuo-Iwasawa Lab, The University of Tokyo',
    date: 'Aug 2026',
    sort: 202608,
  },
  {
    src: '/certificates/cert-13.jpg',
    title: 'IDCamp 2025 — Gen AI Engineer, Expert level',
    issuer: 'IDCamp — Dicoding × Indosat',
    date: 'Aug 2026',
    sort: 202608,
    ref: 'IDCAMP2025/L3-GAI-043',
  },
  {
    src: '/certificates/cert-05.jpg',
    title: 'Intelligent by Design: Build an AI Agent',
    issuer: 'IBM SkillsBuild',
    date: 'Jul 2026',
    sort: 202607,
    ref: 'ALM-COURSE_3946359',
  },
  {
    src: '/certificates/cert-03.jpg',
    title: 'Introduction to Large Language Models',
    issuer: 'IBM SkillsBuild',
    date: 'Jul 2026',
    sort: 202607,
    ref: 'ALM-COURSE_4058915',
  },
  {
    src: '/certificates/cert-04.jpg',
    title: 'Lab: Troubleshoot Your Code Using IBM Bob',
    issuer: 'IBM SkillsBuild',
    date: 'Jul 2026',
    sort: 202607,
    ref: 'ALM-COURSE_4071307',
  },
  {
    src: '/certificates/cert-37.jpg',
    title: 'Pengembangan Generative AI berbasis LLM',
    issuer: 'Dicoding',
    date: 'Jun 2026',
    sort: 202606,
    verify: 'https://dicoding.com/certificates/81P2OMKGNZOY',
  },
  {
    src: '/certificates/cert-01.jpg',
    title: 'AI Praktis untuk Produktivitas',
    issuer: 'Dicoding',
    date: 'May 2026',
    sort: 202605,
    verify: 'https://dicoding.com/certificates/2VX305VD3XYQ',
  },
  {
    src: '/certificates/cert-10.jpg',
    title: 'Belajar Fundamental Generative AI',
    issuer: 'Dicoding',
    date: 'Apr 2026',
    sort: 202604,
    verify: 'https://dicoding.com/certificates/EYX4Q05W5PDL',
  },
  {
    src: '/certificates/cert-14.jpg',
    title: 'IDCamp 2025 — Gen AI Engineer, Intermediate level',
    issuer: 'IDCamp — Dicoding × Indosat',
    date: 'Mar 2026',
    sort: 202603,
    ref: 'IDCAMP2025/L2-GAI-050',
  },
  {
    src: '/certificates/cert-35.jpg',
    title: 'Belajar Strategi Pengembangan Diri',
    issuer: 'Dicoding',
    date: 'Mar 2026',
    sort: 202603,
    verify: 'https://dicoding.com/certificates/6RPN7WQK8X2M',
  },
  {
    src: '/certificates/cert-40.jpg',
    title: 'Introduction to Financial Literacy',
    issuer: 'Dicoding',
    date: 'Mar 2026',
    sort: 202603,
    verify: 'https://dicoding.com/certificates/KEXLQ0O40PG2',
  },
  {
    src: '/certificates/cert-09.jpg',
    title: 'Belajar Fundamental Deep Learning',
    issuer: 'Dicoding',
    date: 'Mar 2026',
    sort: 202603,
    verify: 'https://dicoding.com/certificates/0LZ0Y9ED3X65',
  },
  {
    src: '/certificates/cert-29.jpg',
    title: 'Memulai Pemrograman dengan C',
    issuer: 'Dicoding',
    date: 'Mar 2026',
    sort: 202603,
    verify: 'https://dicoding.com/certificates/1RXYW6L6KZVM',
  },
  {
    src: '/certificates/cert-06.jpg',
    title: 'Supervised Machine Learning: Regression and Classification',
    issuer: 'Coursera — DeepLearning.AI & Stanford',
    date: 'Feb 2026',
    sort: 202602,
    verify: 'https://coursera.org/verify/XQ4P6SVN35Z1',
  },
  {
    src: '/certificates/cert-21.jpg',
    title: 'Complete MySQL Bootcamp: Learn SQL Step by Step',
    issuer: 'Udemy',
    date: 'Dec 2025',
    sort: 202512,
    verify: 'https://ude.my/UC-2cfeb92e-b9c6-46c4-bea9-a9b37ad74c98',
  },
  {
    src: '/certificates/cert-22.jpg',
    title: 'AI Engineer Explorer Certificate Course',
    issuer: 'Udemy',
    date: 'Dec 2025',
    sort: 202512,
    verify: 'https://ude.my/UC-35825eb1-cfd4-4eb4-8b38-19c3e47866a7',
  },
  {
    src: '/certificates/cert-24.jpg',
    title: 'ChatGPT: Earning Money With ChatGPT - Easy Way For Beginners',
    issuer: 'Udemy',
    date: 'Dec 2025',
    sort: 202512,
    verify: 'https://ude.my/UC-79cf31e4-b9a5-4e89-8488-dcadc5f3ba76',
  },
  {
    src: '/certificates/cert-26.jpg',
    title: 'Geospatial AI: Deep Learning for Satellite Imagery',
    issuer: 'Udemy',
    date: 'Dec 2025',
    sort: 202512,
    verify: 'https://ude.my/UC-b79f65c4-ee9c-4b17-afbb-05ea308fb270',
  },
  {
    src: '/certificates/cert-30.jpg',
    title: 'Belajar Machine Learning untuk Pemula',
    issuer: 'Dicoding',
    date: 'Dec 2025',
    sort: 202512,
    verify: 'https://dicoding.com/certificates/MRZM63KJRPYQ',
  },
  {
    src: '/certificates/cert-08.jpg',
    title: 'AI For Everyone',
    issuer: 'Coursera — DeepLearning.AI',
    date: 'Nov 2025',
    sort: 202511,
    verify: 'https://coursera.org/verify/YRYEC24SXKSE',
  },
  {
    src: '/certificates/cert-27.jpg',
    title: 'Certified Infra AI Expert: End-to-End GPU-Accelerated AI',
    issuer: 'Udemy',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://ude.my/UC-e34a3cfa-fce6-4dc4-8bc5-142f56a3e9c6',
  },
  {
    src: '/certificates/cert-39.jpg',
    title: 'Memulai Pemrograman dengan Python',
    issuer: 'Dicoding',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://dicoding.com/certificates/JMZVVEYRRZN9',
  },
  {
    src: '/certificates/cert-34.jpg',
    title: 'Belajar Dasar AI',
    issuer: 'Dicoding',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://dicoding.com/certificates/L4PQ2EVLOZO1',
  },
  {
    src: '/certificates/cert-33.jpg',
    title: 'Belajar Pemrograman Prosedural dengan Python',
    issuer: 'Dicoding',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://dicoding.com/certificates/JLX1595NNZ72',
  },
  {
    src: '/certificates/cert-07.jpg',
    title: 'Python for Data Science, AI & Development',
    issuer: 'Coursera — IBM',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://coursera.org/verify/XRZ5N97FMWKJ',
  },
  {
    src: '/certificates/cert-25.jpg',
    title: 'Developing Data Science Projects With Google Colab',
    issuer: 'Udemy',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://ude.my/UC-98c80886-c43a-4173-8e99-c654747dcc9c',
  },
  {
    src: '/certificates/cert-19.jpg',
    title: 'Llama 4: AI Mastering Prompt Engineering',
    issuer: 'Udemy',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://ude.my/UC-0838df9e-4092-4101-aa0c-d64522e8a58d',
  },
  {
    src: '/certificates/cert-31.jpg',
    title: 'Belajar Dasar Structured Query Language (SQL)',
    issuer: 'Dicoding',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://dicoding.com/certificates/EYX4KVKQ5PDL',
  },
  {
    src: '/certificates/cert-23.jpg',
    title: 'Mastering HTML5 and CSS3 (Part 1 - Beginner Level)',
    issuer: 'Udemy',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://ude.my/UC-5da5d5c6-12a5-49ba-918e-d9e08999f5f3',
  },
  {
    src: '/certificates/cert-20.jpg',
    title: '2025 Complete Python Bootcamp from Zero to Hero in Python',
    issuer: 'Udemy',
    date: 'Oct 2025',
    sort: 202510,
    verify: 'https://ude.my/UC-1b2af43f-58b6-4949-af69-3f0abe02c135',
  },
  {
    src: '/certificates/cert-17.jpg',
    title: 'Intermediate Junior Web Developer',
    issuer: 'Komdigi — Digital Talent Scholarship (VSGA)',
    date: 'Sep 2025',
    sort: 202509,
    ref: '19311071840-969/VSGA/BLSDM.Komdigi/2025',
  },
  {
    src: '/certificates/cert-28.jpg',
    title: 'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate',
    issuer: 'Oracle',
    date: 'Sep 2025',
    sort: 202509,
    ref: '102759980OCI25AICFA',
  },
  {
    src: '/certificates/cert-32.jpg',
    title: 'Belajar Dasar Data Science',
    issuer: 'Dicoding',
    date: 'Sep 2025',
    sort: 202509,
    verify: 'https://dicoding.com/certificates/L4PQ28VQ2ZO1',
  },
  {
    src: '/certificates/cert-38.jpg',
    title: 'Belajar Penggunaan Generative AI',
    issuer: 'Dicoding',
    date: 'Sep 2025',
    sort: 202509,
    verify: 'https://dicoding.com/certificates/RVZKGLLMQXD5',
  },
  {
    src: '/certificates/cert-36.jpg',
    title: 'Prompt Engineering untuk Software Developer',
    issuer: 'Dicoding',
    date: 'Sep 2025',
    sort: 202509,
    verify: 'https://dicoding.com/certificates/53XEKNRRKXRN',
  },
  {
    src: '/certificates/cert-15.jpg',
    title: 'Hour of Code — AI Ready ASEAN',
    issuer: 'Ruangguru',
    date: 'Sep 2025',
    sort: 202509,
    ref: '1087/03/RG/Govrel/IX/2025',
  },
  {
    src: '/certificates/cert-16.jpg',
    title: 'AI Engineer for Milenial',
    issuer: 'Komdigi — Digital Talent Scholarship',
    date: 'Aug 2025',
    sort: 202508,
    ref: '22910029850-8414/MS/BLSDM.Komdigi/2025',
  },
  {
    src: '/certificates/cert-18.jpg',
    title: 'Konsep Pemrograman',
    issuer: 'Komdigi — Digital Talent Scholarship',
    date: 'Aug 2025',
    sort: 202508,
    ref: '2299793850-7897/MS/BLSDM.Komdigi/2025',
  },
];

/**
 * The plates that ride the carousel ring, front first — one flagship per
 * issuing context, so the ring reads as a survey rather than a pile:
 * government (Komdigi), bootcamp scholarship (IDCamp), academic (UTokyo),
 * MOOC (DeepLearning.AI/Stanford, IBM), vendor (Oracle), and the platform
 * courses that carried the fundamentals. The full 40 live in the registry.
 */
export const plateMerit: string[] = [
  '/certificates/cert-13.jpg',
  '/certificates/cert-02.jpg',
  '/certificates/cert-06.jpg',
  '/certificates/cert-03.jpg',
  '/certificates/cert-28.jpg',
  '/certificates/cert-37.jpg',
  '/certificates/cert-11.jpg',
  '/certificates/cert-09.jpg',
  '/certificates/cert-22.jpg',
  '/certificates/cert-27.jpg',
  '/certificates/cert-16.jpg',
  '/certificates/cert-07.jpg',
];
