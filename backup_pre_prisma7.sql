--
-- PostgreSQL database dump
--

\restrict 6b6dtmwgPjxs0PmdcaJ5VOec2haWcHTrRnAt2vebQiNR2f0MFufWCnPaS323F4l

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: ucebnice_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ucebnice_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: ucebnice_user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO ucebnice_user;

--
-- Name: Achievement; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."Achievement" (
    id text NOT NULL,
    "badgeId" text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    "xpReward" integer NOT NULL,
    rarity text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Achievement" OWNER TO ucebnice_user;

--
-- Name: Chapter; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."Chapter" (
    id text NOT NULL,
    "chapterId" text NOT NULL,
    title text NOT NULL,
    description text,
    "xpReward" integer DEFAULT 100 NOT NULL,
    difficulty text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Chapter" OWNER TO ucebnice_user;

--
-- Name: ChapterCompletion; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."ChapterCompletion" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "chapterId" text NOT NULL,
    "completedChapter" boolean DEFAULT false NOT NULL,
    "answeredQuestions" boolean DEFAULT false NOT NULL,
    "submittedProject" boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChapterCompletion" OWNER TO ucebnice_user;

--
-- Name: ChapterProgress; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."ChapterProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "chapterId" text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChapterProgress" OWNER TO ucebnice_user;

--
-- Name: CognitiveGlitchAttempt; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."CognitiveGlitchAttempt" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "challengeId" text NOT NULL,
    correct boolean NOT NULL,
    "hintUsed" boolean DEFAULT false NOT NULL,
    "timeElapsed" integer NOT NULL,
    "xpEarned" integer NOT NULL,
    "attemptedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CognitiveGlitchAttempt" OWNER TO ucebnice_user;

--
-- Name: CompletedChapter; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."CompletedChapter" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "chapterId" text NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "xpEarned" integer NOT NULL
);


ALTER TABLE public."CompletedChapter" OWNER TO ucebnice_user;

--
-- Name: ModuleTestAttempt; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."ModuleTestAttempt" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "moduleNumber" integer NOT NULL,
    score integer NOT NULL,
    "totalQuestions" integer DEFAULT 10 NOT NULL,
    "timeElapsed" integer NOT NULL,
    "attemptNumber" integer NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    abandoned boolean DEFAULT false NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "moduleStars" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."ModuleTestAttempt" OWNER TO ucebnice_user;

--
-- Name: ProjectSubmission; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."ProjectSubmission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "chapterId" text NOT NULL,
    "projectUrl" text NOT NULL,
    description text,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProjectSubmission" OWNER TO ucebnice_user;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    "chapterId" text NOT NULL,
    "questionNumber" integer NOT NULL,
    "questionText" text NOT NULL,
    options jsonb NOT NULL,
    "correctAnswer" integer NOT NULL,
    explanation text,
    "xpReward" integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Question" OWNER TO ucebnice_user;

--
-- Name: QuestionAnswer; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."QuestionAnswer" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "chapterId" text NOT NULL,
    "questionId" text NOT NULL,
    answer text NOT NULL,
    correct boolean NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "answeredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QuestionAnswer" OWNER TO ucebnice_user;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO ucebnice_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text,
    "emailVerified" timestamp(3) without time zone,
    name text,
    image text,
    password text,
    username text,
    xp integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO ucebnice_user;

--
-- Name: UserAchievement; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."UserAchievement" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "achievementId" text NOT NULL,
    "unlockedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserAchievement" OWNER TO ucebnice_user;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO ucebnice_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ucebnice_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ucebnice_user;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."Achievement" (id, "badgeId", name, description, icon, "xpReward", rarity, "createdAt") FROM stdin;
\.


--
-- Data for Name: Chapter; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."Chapter" (id, "chapterId", title, description, "xpReward", difficulty, "order", "createdAt", "updatedAt") FROM stdin;
7b6489fd-42c2-43ce-8fa3-831b9fb8faad	01	Co je umělá inteligence?	Úvod do umělé inteligence, základní pojmy a definice	100	střední	1	2026-01-08 19:47:47.053	2026-01-08 19:47:47.053
8263172e-1547-4ea3-9268-797d73be4a84	02	Historie AI	Historický vývoj umělé inteligence a klíčové milníky	100	střední	2	2026-01-08 19:47:47.066	2026-01-08 19:47:47.066
b2d099ce-06ff-4585-b709-7a3b05a244e9	03	Budoucnost AI	Scénáře budoucího vývoje AI a její dopad na společnost	100	střední	3	2026-01-08 19:47:47.067	2026-01-08 19:47:47.067
9930bed1-b4e7-4b10-bdde-060d42849698	04	Příbuzné obory	AI vs. datová věda, statistika a kognitivní věda	100	střední	4	2026-01-08 19:47:47.069	2026-01-08 19:47:47.069
5915f5ef-c4ae-4b8a-879f-21d0237ff669	05	Lidská vs. strojová inteligence	Porovnání kognitivních procesů člověka a stroje	100	střední	5	2026-01-08 19:47:47.07	2026-01-08 19:47:47.07
ce8db835-899e-4b2a-82a7-a357f0cd3e56	06	Etika a filozofie AI	Etické otázky, zodpovědnost a filozofické aspekty AI	100	střední	6	2026-01-08 19:47:47.071	2026-01-08 19:47:47.071
27029e3d-b8bc-43e9-8226-8a59c64372ff	07	AI v každodenním životě	Praktické aplikace AI ve vyhledávačích, dopravě a medicíně	100	střední	7	2026-01-08 19:47:47.073	2026-01-08 19:47:47.073
8e6a2a03-2116-4887-bb3c-60c005c7d22b	08	AI ve hrách	Tradiční herní AI a moderní přístupy pomocí učení	100	střední	8	2026-01-08 19:47:47.074	2026-01-08 19:47:47.074
e4454bcc-f79f-46d3-8337-e9dbde9eb2a7	09	Mini projekt	Návrh a implementace jednoduchého AI projektu	100	střední	9	2026-01-08 19:47:47.075	2026-01-08 19:47:47.075
59e2fd6e-4149-4f21-9d28-c04b528a4afe	10	Shrnutí a opakování	Opakování základních pojmů a příprava na další modul	100	střední	10	2026-01-08 19:47:47.076	2026-01-08 19:47:47.076
adfb23d5-2b9f-4104-a4ed-926d535aa943	11	Prostor stavů	Modelování problémů jako grafu stavů	100	střední	11	2026-01-08 19:47:47.078	2026-01-08 19:47:47.078
5f517a16-6981-4006-af81-f73529d4a7ec	12	Algoritmy pro hledání	BFS, DFS a jejich použití	100	střední	12	2026-01-08 19:47:47.079	2026-01-08 19:47:47.079
a9f8a987-7067-49f2-95cb-ede83c8a8225	13	Heuristiky a A* algoritmus	Efektivní hledání pomocí heuristik	100	střední	13	2026-01-08 19:47:47.08	2026-01-08 19:47:47.08
85550bc6-9218-43ca-bf43-976b85dd7381	14	Labyrint a AI	Řešení bludišť pomocí AI algoritmů	100	střední	14	2026-01-08 19:47:47.081	2026-01-08 19:47:47.081
ebf89d5a-b2f4-4782-a630-1996178f3440	15	Projekt - Řešič problémů	Tvorba programu pro řešení konkrétního problému	100	střední	15	2026-01-08 19:47:47.083	2026-01-08 19:47:47.083
fa923404-606f-49ec-a6d6-022c50cbccee	16	Úvod do pravděpodobnosti	Základní pojmy a zákony pravděpodobnosti	100	střední	16	2026-01-08 19:47:47.084	2026-01-08 19:47:47.084
6d7a74d1-2a35-4846-9518-3e5c03c83f1c	17	Neurčitost a predikce	Práce s nejistými daty a predikční modely	100	střední	17	2026-01-08 19:47:47.085	2026-01-08 19:47:47.085
60dadf40-6767-4593-920d-2505f2efa84d	18	Bayesova věta	Bayesovo uvažování a aktualizace přesvědčení	100	střední	18	2026-01-08 19:47:47.086	2026-01-08 19:47:47.086
587fbdb4-1573-46ec-8b9c-e7fa33a1361a	19	Naivní Bayesův klasifikátor	Implementace spamového filtru a klasifikace textu	100	střední	19	2026-01-08 19:47:47.087	2026-01-08 19:47:47.087
df2034ab-36af-4fa4-96d0-4f0f4f3674e4	20	Klasifikace v praxi	Předzpracování dat a trénování klasifikačního modelu	100	střední	20	2026-01-08 19:47:47.088	2026-01-08 19:47:47.088
c85dcea4-6e64-475f-95d5-39e7737f827d	21	Úvod do strojového učení	Učení s učitelem, bez učitele a posilované učení	100	střední	21	2026-01-08 19:47:47.09	2026-01-08 19:47:47.09
1c3c6487-8570-4b00-bf90-6bdc230368f8	22	Zpracování dat	Čištění dat a příprava pro strojové učení	100	střední	22	2026-01-08 19:47:47.091	2026-01-08 19:47:47.091
d97468ab-fb5f-4cb9-ad53-d42e81faca80	23	Formáty dat	CSV, JSON, XML a práce s různými formáty	100	střední	23	2026-01-08 19:47:47.092	2026-01-08 19:47:47.092
c9d67659-5331-48ad-9b60-9592cca6c508	24	Regrese	Lineární regrese a predikce spojitých hodnot	100	střední	24	2026-01-08 19:47:47.093	2026-01-08 19:47:47.093
f93885ed-6b0c-41c3-a2f2-1b1703a407c6	25	KNN klasifikace	K-nejbližších sousedů algoritmus	100	střední	25	2026-01-08 19:47:47.095	2026-01-08 19:47:47.095
306621ee-6bc1-4de9-8b12-eb62de9fb5ae	26	Vlastní model	Tvorba a vyhodnocení vlastního ML modelu	100	střední	26	2026-01-08 19:47:47.096	2026-01-08 19:47:47.096
51fbac11-2bc0-42c5-b511-df2c3bf79287	27	Vizualizace dat	Grafické zobrazení dat a výsledků modelů	100	střední	27	2026-01-08 19:47:47.097	2026-01-08 19:47:47.097
baa751c5-d802-417b-a44a-91572bd764df	28	Úvod do neuronových sítí	Biologická inspirace a základní principy	100	střední	28	2026-01-08 19:47:47.098	2026-01-08 19:47:47.098
90770c95-3e0f-4e25-9b3b-765b17b7f981	29	Perceptron a architektura NN	Základní model neuronu a struktura sítí	100	střední	29	2026-01-08 19:47:47.099	2026-01-08 19:47:47.099
28f4781a-b41c-49f5-9aad-f3b6ea1fc238	30	Funkce aktivace	Sigmoid, ReLU, Tanh a jejich použití	100	střední	30	2026-01-08 19:47:47.1	2026-01-08 19:47:47.1
71bfb26b-534d-400b-b1ec-89a7117bc970	31	Zpětná propagace	Algoritmus učení neuronových sítí	100	střední	31	2026-01-08 19:47:47.102	2026-01-08 19:47:47.102
bc7eb294-3e46-4446-8d5a-619580344159	32	Dropout	Technika prevence přeučení	100	střední	32	2026-01-08 19:47:47.103	2026-01-08 19:47:47.103
9aa74d16-ff66-4646-92a5-f7665c173989	33	Konvoluce	Konvoluční neuronové sítě pro zpracování obrazu	100	střední	33	2026-01-08 19:47:47.104	2026-01-08 19:47:47.104
be0c8e8d-46a1-499d-9c4e-549986e78e60	34	Teachable Machine	Trénování modelů bez programování	100	střední	34	2026-01-08 19:47:47.105	2026-01-08 19:47:47.105
7be7334d-9a2b-48e2-965c-5866fb24d96e	35	Projekt - Neuronová síť	Návrh a implementace vlastní neuronové sítě	100	střední	35	2026-01-08 19:47:47.106	2026-01-08 19:47:47.106
528835dd-8381-452a-bd68-7472ee4a9de0	36	Rizika AI	Zneužití dat, autonomní zbraně a sociální nerovnosti	100	střední	36	2026-01-08 19:47:47.107	2026-01-08 19:47:47.107
f6281436-bc19-406a-86af-2b59cd644840	37	AI a trh práce	Automatizace, nové profese a přeškolování	100	střední	37	2026-01-08 19:47:47.109	2026-01-08 19:47:47.109
c00444cc-4b9d-47de-bed9-076fd39c97cf	38	Etika a odpovědnost	Zodpovědnost za chyby AI a transparentnost algoritmů	100	střední	38	2026-01-08 19:47:47.11	2026-01-08 19:47:47.11
b54d18bc-53a7-4dd1-aa9a-074ed8d910d2	39	Budoucnost AI	Vize a diskuze o budoucnosti umělé inteligence	100	střední	39	2026-01-08 19:47:47.112	2026-01-08 19:47:47.112
a140fdf2-def6-4466-ad45-578219512a61	40	Závěr a reflexe	Shrnutí kurzu a další kroky	100	střední	40	2026-01-08 19:47:47.113	2026-01-08 19:47:47.113
\.


--
-- Data for Name: ChapterCompletion; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."ChapterCompletion" (id, "userId", "chapterId", "completedChapter", "answeredQuestions", "submittedProject", "completedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChapterProgress; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."ChapterProgress" (id, "userId", "chapterId", progress, "lastUpdated") FROM stdin;
\.


--
-- Data for Name: CognitiveGlitchAttempt; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."CognitiveGlitchAttempt" (id, "userId", "challengeId", correct, "hintUsed", "timeElapsed", "xpEarned", "attemptedAt") FROM stdin;
\.


--
-- Data for Name: CompletedChapter; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."CompletedChapter" (id, "userId", "chapterId", "completedAt", "xpEarned") FROM stdin;
\.


--
-- Data for Name: ModuleTestAttempt; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."ModuleTestAttempt" (id, "userId", "moduleNumber", score, "totalQuestions", "timeElapsed", "attemptNumber", completed, abandoned, "xpEarned", "moduleStars", "createdAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: ProjectSubmission; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."ProjectSubmission" (id, "userId", "chapterId", "projectUrl", description, "xpEarned", "submittedAt") FROM stdin;
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."Question" (id, "chapterId", "questionNumber", "questionText", options, "correctAnswer", explanation, "xpReward", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QuestionAnswer; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."QuestionAnswer" (id, "userId", "chapterId", "questionId", answer, correct, "xpEarned", "answeredAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."User" (id, email, "emailVerified", name, image, password, username, xp, level, "currentStreak", "longestStreak", "createdAt", "updatedAt", "isAdmin") FROM stdin;
\.


--
-- Data for Name: UserAchievement; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."UserAchievement" (id, "userId", "achievementId", "unlockedAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ucebnice_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
15ea8a56-282b-490c-8fbf-ca6b2ae4c2cb	6b8d0b68de66f8fbe899c58dba2badfaf0ee61ec0330dba59352465864cd0eea	2026-01-08 19:47:46.768346+00	20251112134602_init_postgresql	\N	\N	2026-01-08 19:47:46.610237+00	1
7603fe5e-c847-4d06-95df-683f5296da78	5b50ce8666d57ec920bdf1e7f2c3281b8b125a540b867844fb8d5e1b6c4c2a20	2026-01-08 19:47:46.811685+00	20251124231751_rename_leson_to_chapter	\N	\N	2026-01-08 19:47:46.769837+00	1
f97fbbf2-a345-4b75-9d79-16146df7ca2e	b530b69852f47387d2f24221883a874fdd8dd635d2142afb8ec2a18bf84857c4	2026-01-08 19:47:57.823166+00	20260108194757_adds_questions_table	\N	\N	2026-01-08 19:47:57.803948+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: ChapterCompletion ChapterCompletion_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ChapterCompletion"
    ADD CONSTRAINT "ChapterCompletion_pkey" PRIMARY KEY (id);


--
-- Name: ChapterProgress ChapterProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ChapterProgress"
    ADD CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY (id);


--
-- Name: Chapter Chapter_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Chapter"
    ADD CONSTRAINT "Chapter_pkey" PRIMARY KEY (id);


--
-- Name: CognitiveGlitchAttempt CognitiveGlitchAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."CognitiveGlitchAttempt"
    ADD CONSTRAINT "CognitiveGlitchAttempt_pkey" PRIMARY KEY (id);


--
-- Name: CompletedChapter CompletedChapter_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."CompletedChapter"
    ADD CONSTRAINT "CompletedChapter_pkey" PRIMARY KEY (id);


--
-- Name: ModuleTestAttempt ModuleTestAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ModuleTestAttempt"
    ADD CONSTRAINT "ModuleTestAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ProjectSubmission ProjectSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ProjectSubmission"
    ADD CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY (id);


--
-- Name: QuestionAnswer QuestionAnswer_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."QuestionAnswer"
    ADD CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: UserAchievement UserAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- Name: Achievement_badgeId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Achievement_badgeId_idx" ON public."Achievement" USING btree ("badgeId");


--
-- Name: Achievement_badgeId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "Achievement_badgeId_key" ON public."Achievement" USING btree ("badgeId");


--
-- Name: Achievement_rarity_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Achievement_rarity_idx" ON public."Achievement" USING btree (rarity);


--
-- Name: ChapterCompletion_chapterId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ChapterCompletion_chapterId_idx" ON public."ChapterCompletion" USING btree ("chapterId");


--
-- Name: ChapterCompletion_completedAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ChapterCompletion_completedAt_idx" ON public."ChapterCompletion" USING btree ("completedAt");


--
-- Name: ChapterCompletion_userId_chapterId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "ChapterCompletion_userId_chapterId_key" ON public."ChapterCompletion" USING btree ("userId", "chapterId");


--
-- Name: ChapterCompletion_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ChapterCompletion_userId_idx" ON public."ChapterCompletion" USING btree ("userId");


--
-- Name: ChapterProgress_chapterId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ChapterProgress_chapterId_idx" ON public."ChapterProgress" USING btree ("chapterId");


--
-- Name: ChapterProgress_lastUpdated_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ChapterProgress_lastUpdated_idx" ON public."ChapterProgress" USING btree ("lastUpdated");


--
-- Name: ChapterProgress_userId_chapterId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "ChapterProgress_userId_chapterId_key" ON public."ChapterProgress" USING btree ("userId", "chapterId");


--
-- Name: ChapterProgress_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ChapterProgress_userId_idx" ON public."ChapterProgress" USING btree ("userId");


--
-- Name: Chapter_chapterId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "Chapter_chapterId_key" ON public."Chapter" USING btree ("chapterId");


--
-- Name: Chapter_difficulty_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Chapter_difficulty_idx" ON public."Chapter" USING btree (difficulty);


--
-- Name: Chapter_order_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Chapter_order_idx" ON public."Chapter" USING btree ("order");


--
-- Name: CognitiveGlitchAttempt_attemptedAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "CognitiveGlitchAttempt_attemptedAt_idx" ON public."CognitiveGlitchAttempt" USING btree ("attemptedAt");


--
-- Name: CognitiveGlitchAttempt_challengeId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "CognitiveGlitchAttempt_challengeId_idx" ON public."CognitiveGlitchAttempt" USING btree ("challengeId");


--
-- Name: CognitiveGlitchAttempt_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "CognitiveGlitchAttempt_userId_idx" ON public."CognitiveGlitchAttempt" USING btree ("userId");


--
-- Name: CompletedChapter_chapterId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "CompletedChapter_chapterId_idx" ON public."CompletedChapter" USING btree ("chapterId");


--
-- Name: CompletedChapter_completedAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "CompletedChapter_completedAt_idx" ON public."CompletedChapter" USING btree ("completedAt");


--
-- Name: CompletedChapter_userId_chapterId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "CompletedChapter_userId_chapterId_key" ON public."CompletedChapter" USING btree ("userId", "chapterId");


--
-- Name: CompletedChapter_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "CompletedChapter_userId_idx" ON public."CompletedChapter" USING btree ("userId");


--
-- Name: ModuleTestAttempt_createdAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ModuleTestAttempt_createdAt_idx" ON public."ModuleTestAttempt" USING btree ("createdAt");


--
-- Name: ModuleTestAttempt_moduleNumber_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ModuleTestAttempt_moduleNumber_idx" ON public."ModuleTestAttempt" USING btree ("moduleNumber");


--
-- Name: ModuleTestAttempt_score_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ModuleTestAttempt_score_idx" ON public."ModuleTestAttempt" USING btree (score);


--
-- Name: ModuleTestAttempt_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ModuleTestAttempt_userId_idx" ON public."ModuleTestAttempt" USING btree ("userId");


--
-- Name: ModuleTestAttempt_userId_moduleNumber_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ModuleTestAttempt_userId_moduleNumber_idx" ON public."ModuleTestAttempt" USING btree ("userId", "moduleNumber");


--
-- Name: ProjectSubmission_chapterId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ProjectSubmission_chapterId_idx" ON public."ProjectSubmission" USING btree ("chapterId");


--
-- Name: ProjectSubmission_submittedAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ProjectSubmission_submittedAt_idx" ON public."ProjectSubmission" USING btree ("submittedAt");


--
-- Name: ProjectSubmission_userId_chapterId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "ProjectSubmission_userId_chapterId_key" ON public."ProjectSubmission" USING btree ("userId", "chapterId");


--
-- Name: ProjectSubmission_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "ProjectSubmission_userId_idx" ON public."ProjectSubmission" USING btree ("userId");


--
-- Name: QuestionAnswer_answeredAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "QuestionAnswer_answeredAt_idx" ON public."QuestionAnswer" USING btree ("answeredAt");


--
-- Name: QuestionAnswer_chapterId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "QuestionAnswer_chapterId_idx" ON public."QuestionAnswer" USING btree ("chapterId");


--
-- Name: QuestionAnswer_userId_chapterId_questionId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "QuestionAnswer_userId_chapterId_questionId_key" ON public."QuestionAnswer" USING btree ("userId", "chapterId", "questionId");


--
-- Name: QuestionAnswer_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "QuestionAnswer_userId_idx" ON public."QuestionAnswer" USING btree ("userId");


--
-- Name: Question_chapterId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Question_chapterId_idx" ON public."Question" USING btree ("chapterId");


--
-- Name: Question_chapterId_questionNumber_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "Question_chapterId_questionNumber_key" ON public."Question" USING btree ("chapterId", "questionNumber");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: UserAchievement_achievementId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "UserAchievement_achievementId_idx" ON public."UserAchievement" USING btree ("achievementId");


--
-- Name: UserAchievement_unlockedAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "UserAchievement_unlockedAt_idx" ON public."UserAchievement" USING btree ("unlockedAt");


--
-- Name: UserAchievement_userId_achievementId_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON public."UserAchievement" USING btree ("userId", "achievementId");


--
-- Name: UserAchievement_userId_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "UserAchievement_userId_idx" ON public."UserAchievement" USING btree ("userId");


--
-- Name: User_createdAt_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "User_createdAt_idx" ON public."User" USING btree ("createdAt");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_level_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "User_level_idx" ON public."User" USING btree (level);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: User_xp_idx; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE INDEX "User_xp_idx" ON public."User" USING btree (xp);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: ucebnice_user
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChapterCompletion ChapterCompletion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ChapterCompletion"
    ADD CONSTRAINT "ChapterCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChapterProgress ChapterProgress_chapterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ChapterProgress"
    ADD CONSTRAINT "ChapterProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES public."Chapter"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChapterProgress ChapterProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ChapterProgress"
    ADD CONSTRAINT "ChapterProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CognitiveGlitchAttempt CognitiveGlitchAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."CognitiveGlitchAttempt"
    ADD CONSTRAINT "CognitiveGlitchAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompletedChapter CompletedChapter_chapterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."CompletedChapter"
    ADD CONSTRAINT "CompletedChapter_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES public."Chapter"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompletedChapter CompletedChapter_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."CompletedChapter"
    ADD CONSTRAINT "CompletedChapter_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ModuleTestAttempt ModuleTestAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ModuleTestAttempt"
    ADD CONSTRAINT "ModuleTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectSubmission ProjectSubmission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."ProjectSubmission"
    ADD CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionAnswer QuestionAnswer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."QuestionAnswer"
    ADD CONSTRAINT "QuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_chapterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES public."Chapter"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserAchievement UserAchievement_achievementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES public."Achievement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserAchievement UserAchievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ucebnice_user
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: ucebnice_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 6b6dtmwgPjxs0PmdcaJ5VOec2haWcHTrRnAt2vebQiNR2f0MFufWCnPaS323F4l

