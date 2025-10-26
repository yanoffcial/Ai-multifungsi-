import type { Feature } from './types';
import TemanCurhat from './features/Free/TemanCurhat';
import AiChat from './features/Free/AiChat';
import TextToSpeech from './features/Free/TextToSpeech';
import Eli5Explainer from './features/Free/Eli5Explainer';
import LyricsGenerator from './features/Free/LyricsGenerator';
import ImageCreator from './features/Premium/ImageCreator';
import LiveAiChat from './features/Premium/LiveAiChat';
import TextSummarizer from './features/Free/TextSummarizer';
import CodeAssistant from './features/Free/CodeAssistant';
import AudioTranscriber from './features/Free/AudioTranscriber';
import ImageAnalyzer from './features/Free/ImageAnalyzer';
import EssayWriter from './features/Premium/EssayWriter';
import StoryWriter from './features/Premium/StoryWriter';
import ImageEditor from './features/Premium/ImageEditor';
import VideoGenerator from './features/Premium/VideoGenerator';
import TanyaWeb from './features/Premium/TanyaWeb';
import PersonaChat from './features/Premium/PersonaChat';
import GitHubAssistant from './features/Premium/GitHubAssistant';
import CodePackager from './features/Premium/CodePackager';
import EmailHeaderAnalyzer from './features/Premium/EmailHeaderAnalyzer';
import MailComposer from './features/Free/MailComposer';
import CodeRefiner from './features/Premium/CodeRefiner';
import LocationFinder from './features/Premium/LocationFinder';


import {
  ChatBubbleIcon,
  SparklesIcon, 
  PhotoIcon,
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  MusicNoteIcon,
  FaceSmileIcon,
  ScissorsIcon,
  CodeBracketIcon,
  ViewfinderIcon,
  BookOpenIcon,
  PaintBrushIcon,
  WaveformIcon,
  VideoCameraIcon,
  GlobeIcon,
  UserGroupIcon,
  GitHubIcon,
  PencilSquareIcon,
  CubeTransparentIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  MapIcon,
} from './components/icons/FeatureIcons';

export const ACCESS_CODES = {
  PRIVATE: '030910',
  PUBLIC: '090311',
};

export const FEATURES: Feature[] = [
  // --- Gratis ---
  {
    id: 'ai-chat',
    name: 'AI Chat',
    description: 'Chat serbaguna untuk tanya apa pun — dari ilmu pengetahuan sampai ide kreatif.',
    isPremium: false,
    category: 'Gratis',
    Icon: SparklesIcon,
    component: AiChat,
  },
  {
    id: 'teman-curhat',
    name: 'Teman Curhat',
    description: 'Ngobrol santai dengan AI yang bisa mendengarkan keluh kesah Anda.',
    isPremium: false,
    category: 'Gratis',
    Icon: ChatBubbleIcon,
    component: TemanCurhat,
  },
  {
    id: 'mail-composer',
    name: 'Mail Composer',
    description: 'Buat draf email profesional atau santai dari poin-poin singkat.',
    isPremium: false,
    category: 'Gratis',
    Icon: EnvelopeIcon,
    component: MailComposer,
  },
  {
    id: 'text-summarizer',
    name: 'Text Summarizer',
    description: 'Meringkas teks atau artikel panjang secara otomatis untuk menghemat waktu.',
    isPremium: false,
    category: 'Gratis',
    Icon: ScissorsIcon,
    component: TextSummarizer,
  },
  {
    id: 'code-assistant',
    name: 'Code Generator',
    description: 'Hasilkan cuplikan kode, fungsi, atau seluruh skrip dari deskripsi teks.',
    isPremium: false,
    category: 'Gratis',
    Icon: CodeBracketIcon,
    component: CodeAssistant,
  },
   {
    id: 'image-analyzer',
    name: 'Image Analyzer',
    description: 'Unggah gambar lalu ajukan pertanyaan untuk mendapatkan analisis dari AI.',
    isPremium: false,
    category: 'Gratis',
    Icon: ViewfinderIcon,
    component: ImageAnalyzer,
  },
  {
    id: 'audio-transcriber',
    name: 'Audio Transcriber',
    description: 'Mengubah rekaman suara atau audio menjadi teks secara otomatis.',
    isPremium: false,
    category: 'Gratis',
    Icon: WaveformIcon,
    component: AudioTranscriber,
  },
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech',
    description: 'Mengubah teks menjadi suara AI natural dengan pilihan gaya bicara.',
    isPremium: false,
    category: 'Gratis',
    Icon: SpeakerWaveIcon,
    component: TextToSpeech,
  },
  {
    id: 'lyrics-generator',
    name: 'Lyrics Generator',
    description: 'Menciptakan lirik lagu orisinal berdasarkan genre dan tema.',
    isPremium: false,
    category: 'Gratis',
    Icon: MusicNoteIcon,
    component: LyricsGenerator,
  },
  {
    id: 'eli5-explainer',
    name: 'ELI5 Explainer',
    description: 'Menjelaskan topik rumit dengan bahasa sederhana.',
    isPremium: false,
    category: 'Gratis',
    Icon: FaceSmileIcon,
    component: Eli5Explainer,
  },

  // --- Premium ---
  {
    id: 'code-refiner',
    name: 'Code Refiner',
    description: 'Dapatkan review kode mendalam untuk menemukan bug dan meningkatkan kualitas.',
    isPremium: true,
    category: 'Premium',
    Icon: PencilSquareIcon,
    component: CodeRefiner,
  },
  {
    id: 'ai-image-generator',
    name: 'AI Image Generator',
    description: 'Menghasilkan gambar artistik atau realistis dari deskripsi teks.',
    isPremium: true,
    category: 'Premium',
    Icon: PhotoIcon,
    component: ImageCreator,
  },
  {
    id: 'image-editor',
    name: 'AI Image Editor',
    description: 'Unggah dan edit gambar menggunakan perintah teks sederhana.',
    isPremium: true,
    category: 'Premium',
    Icon: PaintBrushIcon,
    component: ImageEditor,
  },
  {
    id: 'video-generator',
    name: 'Video Generator',
    description: 'Buat video pendek dari gambar dan teks.',
    isPremium: true,
    category: 'Premium',
    Icon: VideoCameraIcon,
    component: VideoGenerator,
  },
  {
    id: 'essay-writer',
    name: 'Penulis Esai',
    description: 'Bantuan AI untuk menyusun draf esai, artikel, atau tugas menulis.',
    isPremium: true,
    category: 'Premium',
    Icon: BookOpenIcon,
    component: EssayWriter,
  },
  {
    id: 'story-writer',
    name: 'Story Writer',
    description: 'Hasilkan cerita pendek atau panjang berdasarkan ide Anda.',
    isPremium: true,
    category: 'Premium',
    Icon: PencilSquareIcon, // Re-using this icon as it also fits "writing"
    component: StoryWriter,
  },
   {
    id: 'tanya-web',
    name: 'Tanya Web',
    description: 'Dapatkan jawaban akurat dan terkini dari internet, didukung oleh Google Search.',
    isPremium: true,
    category: 'Premium',
    Icon: GlobeIcon,
    component: TanyaWeb,
  },
  {
    id: 'location-finder',
    name: 'Pencari Lokasi',
    description: 'Temukan tempat menarik di sekitar Anda atau di lokasi mana pun, didukung oleh Google Maps.',
    isPremium: true,
    category: 'Premium',
    Icon: MapIcon,
    component: LocationFinder,
  },
  {
    id: 'persona-chat',
    name: 'Persona Chat',
    description: 'Ngobrol dengan AI yang berperan sebagai berbagai karakter ahli.',
    isPremium: true,
    category: 'Premium',
    Icon: UserGroupIcon,
    component: PersonaChat,
  },
  {
    id: 'github-assistant',
    name: 'GitHub Assistant',
    description: 'Generate READMEs, commit messages, .gitignore files, and more.',
    isPremium: true,
    category: 'Premium',
    Icon: GitHubIcon,
    component: GitHubAssistant,
  },
  {
    id: 'live-ai-chat',
    name: 'Live AI Chat',
    description: 'Chat real-time dengan suara — Anda bicara dan AI menjawab langsung.',
    isPremium: true,
    category: 'Premium',
    Icon: MicrophoneIcon,
    component: LiveAiChat,
  },
  {
    id: 'email-header-analyzer',
    name: 'Email Header Analyzer',
    description: 'Analisis jejak email dan periksa protokol keamanan untuk mendeteksi ancaman.',
    isPremium: true,
    category: 'Premium',
    Icon: ShieldCheckIcon,
    component: EmailHeaderAnalyzer,
  },
  {
    id: 'code-packager',
    name: 'APK Builder',
    description: 'Menganalisis package.json Anda untuk membuat APK, log build, dan semua file konfigurasi Android yang diperlukan.',
    isPremium: true,
    category: 'Premium',
    Icon: CubeTransparentIcon,
    component: CodePackager,
  },
];