
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Users, PlayCircle, HardDrive, Upload, Link as LinkIcon, Settings, BarChart3, Trash2, X, Loader, CheckCircle, AlertTriangle, Wifi, WifiOff, FileVideo, Image as ImageIcon, Wand2, RefreshCw, User as UserIcon, Shield, Search, AlertCircle, Edit } from 'lucide-react';
import { supabase, uploadFile } from '../services/supabase';
import { Video } from '../types';

export const AdminDashboard: React.FC = () => {
  // Tabs: 'content' (uploads) or 'team' (user roles)
  const [activeTab, setActiveTab] = useState<'content' | 'team'>('content');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [stats, setStats] = useState({
      videosCount: 0,
      usersCount: 0,
      recentVideos: [] as any[]
  });
  
  // Delete Modal State
  const [videoToDelete, setVideoToDelete] = useState<{id: string, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string>('');
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>('');

  // Team Management State
  const [userList, setUserList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  
  // Form State
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Histórias Bíblicas');
  const [duration, setDuration] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  
  // Inputs
  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Thumbnail Logic
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [generatedThumbPreview, setGeneratedThumbPreview] = useState<string | null>(null);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);

  // Check Auth Role
  const userString = localStorage.getItem('lumen_user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isAdmin = currentUser?.role === 'ADMIN';

  // Check Supabase Connection & Fetch Stats
  useEffect(() => {
    checkConnectionAndFetchData();
  }, [activeTab]);

  const checkConnectionAndFetchData = async () => {
    setConnectionStatus('checking');
    try {
        // Data for Content Tab
        if (activeTab === 'content') {
            const { data: videos, error: videoError, count: vCount } = await supabase
                .from('videos')
                .select('*, profiles(email)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(10);

            const { count: uCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (videoError && !videoError.message.includes('fetch')) {
                 setConnectionStatus('connected'); // Probably connected but empty or RLS issue
                 if (videoError.message.includes('relation') || videoError.code === 'PGRST200') {
                     // Fallback manual fetch if relation missing
                     const { data: videosFallback, count: vCountFallback } = await supabase
                        .from('videos')
                        .select('*', { count: 'exact' })
                        .order('created_at', { ascending: false })
                        .limit(10);
                     
                     // Manual Join for emails
                     const enhancedVideos = await Promise.all((videosFallback || []).map(async (v: any) => {
                         if (v.user_id) {
                             const { data: p } = await supabase.from('profiles').select('email').eq('id', v.user_id).single();
                             return { ...v, profiles: p };
                         }
                         return v;
                     }));

                     setStats({
                        videosCount: vCountFallback || 0,
                        usersCount: uCount || 0,
                        recentVideos: enhancedVideos || []
                     });
                 }
            } else if (videoError) {
                 throw videoError;
            } else {
                 setConnectionStatus('connected');
                 setStats({
                     videosCount: vCount || 0,
                     usersCount: uCount || 0,
                     recentVideos: videos || []
                 });
            }
        } 
        // Data for Team Tab
        else if (activeTab === 'team' && isAdmin) {
            let query = supabase.from('profiles').select('*').order('email');
            if (userSearch) {
                query = query.ilike('email', `%${userSearch}%`);
            }
            const { data: profiles, error } = await query.limit(50);
            
            if (!error) {
                setUserList(profiles || []);
                setConnectionStatus('connected');
            }
        }

    } catch (e) {
        console.error("Connection Check Failed:", e);
        setConnectionStatus('disconnected');
    }
  };

  // --- HANDLERS FOR CONTENT ---

  const handleYoutubeLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setYoutubeLink(val);
      if (uploadType === 'link') {
          setGeneratedThumbPreview(null);
          setThumbnailFile(null);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setVideoFile(file);
      
      if (file) {
          if (file.size > 50 * 1024 * 1024) {
             alert("Atenção: Arquivo > 50MB. Verifique limite do Supabase Free ou use YouTube.");
          }
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src);
              const durationSec = Math.round(video.duration);
              const minutes = Math.floor(durationSec / 60);
              const seconds = durationSec % 60;
              setDuration(`${minutes}m ${seconds}s`);
          }
          video.src = URL.createObjectURL(file);
      }

      if (uploadType === 'file') {
          setGeneratedThumbPreview(null);
          setThumbnailFile(null);
      }
  };

  const generateThumbnail = async () => {
      setIsGeneratingThumb(true);
      setThumbnailFile(null);

      try {
          if (uploadType === 'link') {
              let videoId = '';
              if (youtubeLink.includes('v=')) {
                  videoId = youtubeLink.split('v=')[1].split('&')[0];
              } else if (youtubeLink.includes('youtu.be/')) {
                  videoId = youtubeLink.split('youtu.be/')[1];
              }
              if (!videoId) { alert("Link inválido."); return; }
              setGeneratedThumbPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
          } else {
              if (!videoFile) { alert("Selecione o vídeo."); return; }
              const video = document.createElement('video');
              video.src = URL.createObjectURL(videoFile);
              video.currentTime = 2;
              video.muted = true;
              video.crossOrigin = "anonymous";
              await new Promise((r) => { video.onloadeddata = () => r(true); video.onseeked = () => r(true); });
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              canvas.getContext('2d')?.drawImage(video, 0, 0);
              canvas.toBlob((blob) => {
                  if (blob) {
                      const file = new File([blob], "thumb.jpg", { type: "image/jpeg" });
                      setThumbnailFile(file);
                      setGeneratedThumbPreview(URL.createObjectURL(file));
                  }
              }, 'image/jpeg', 0.9);
          }
      } catch (error) {
          console.error(error);
          alert("Erro ao gerar capa.");
      } finally {
          setIsGeneratingThumb(false);
      }
  };

  const resetForm = () => {
      setTitle('');
      setDescription('');
      setCategory('Histórias Bíblicas');
      setYoutubeLink('');
      setVideoFile(null);
      setThumbnailFile(null);
      setGeneratedThumbPreview(null);
      setDuration('');
      setIsPremium(false);
      setUploadType('link');
      
      // Edit Reset
      setEditingVideoId(null);
      setExistingThumbnailUrl('');
      setExistingVideoUrl('');
  };

  const handleEditVideo = (video: any) => {
      setTitle(video.title);
      setDescription(video.description || '');
      setCategory(video.category || 'Histórias Bíblicas');
      setDuration(video.duration || '');
      setIsPremium(video.is_premium || false);
      
      setExistingThumbnailUrl(video.thumbnail_url);
      setExistingVideoUrl(video.video_url);
      setEditingVideoId(video.id);

      // Determine type based on URL
      if (video.video_url.includes('youtube') || video.video_url.includes('youtu.be')) {
          setUploadType('link');
          setYoutubeLink(video.video_url);
      } else {
          setUploadType('file');
          // We can't set the file object from URL, but we know it exists
      }
      
      setIsUploadModalOpen(true);
  };

  // Abre o modal de confirmação
  const confirmDeleteVideo = (videoId: string, videoTitle: string) => {
      setVideoToDelete({ id: videoId, title: videoTitle });
  };

  // Executa a exclusão real
  const handleExecuteDelete = async () => {
      if (!videoToDelete) return;

      setIsDeleting(true);
      try {
          // Usamos .select() para garantir que o banco confirme a exclusão do registro
          const { data, error } = await supabase
            .from('videos')
            .delete()
            .eq('id', videoToDelete.id)
            .select();

          if (error) throw error;
          
          // Se o RLS bloquear silenciosamente, data será vazio
          if (!data || data.length === 0) {
             throw new Error("O banco de dados não permitiu a exclusão (Verifique as Políticas RLS).");
          }
          
          setVideoToDelete(null); // Fecha o modal
          checkConnectionAndFetchData(); // Atualiza a lista
      } catch (error: any) {
          console.error("Erro ao excluir:", error);
          alert(`Erro ao excluir: ${error.message}`);
          setVideoToDelete(null);
      } finally {
          setIsDeleting(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !category) { alert("Preencha título e categoria."); return; }
      
      // Validation for NEW uploads: Thumbnail mandatory
      // Validation for EDITS: Thumbnail optional (keeps old one)
      if (!editingVideoId && !thumbnailFile && !generatedThumbPreview) { alert("Capa obrigatória."); return; }

      setUploading(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          
          // 1. Upload da Thumbnail (se houver novo)
          let finalThumbnailUrl = existingThumbnailUrl;
          if (thumbnailFile) {
              finalThumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails');
          } else if (generatedThumbPreview) {
              finalThumbnailUrl = generatedThumbPreview;
          }

          // 2. Upload do Vídeo (se houver novo)
          let finalVideoUrl = existingVideoUrl;
          
          // Only process video if logic changes
          if (uploadType === 'link') {
              let videoId = '';
              if (youtubeLink.includes('v=')) videoId = youtubeLink.split('v=')[1].split('&')[0];
              else if (youtubeLink.includes('youtu.be/')) videoId = youtubeLink.split('youtu.be/')[1];
              else if (youtubeLink.includes('embed/')) videoId = youtubeLink.split('embed/')[1].split('?')[0];
              
              if (videoId) {
                  finalVideoUrl = `https://www.youtube.com/embed/${videoId}`;
              } else if (youtubeLink) {
                  finalVideoUrl = youtubeLink; 
              }
          } else if (uploadType === 'file' && videoFile) {
               // Only upload new file if selected
               finalVideoUrl = await uploadFile(videoFile, 'videos');
          }

          const payload: any = {
              title, 
              description, 
              category, 
              video_url: finalVideoUrl, 
              thumbnail_url: finalThumbnailUrl,
              duration: duration || 'Unknown', 
              is_premium: isPremium
          };

          let error;
          if (editingVideoId) {
              // UPDATE
              const { error: updateError } = await supabase
                .from('videos')
                .update(payload)
                .eq('id', editingVideoId);
              error = updateError;
          } else {
              // INSERT
              if (user?.id) payload.user_id = user.id;
              const { error: insertError } = await supabase
                .from('videos')
                .insert(payload);
              error = insertError;
          }

          if (error) throw error;

          resetForm();
          setIsUploadModalOpen(false);
          alert(editingVideoId ? "Vídeo atualizado!" : "Vídeo salvo!");
          checkConnectionAndFetchData();

      } catch (err: any) {
          console.error(err);
          alert(err.message?.includes('policy') ? "Erro de permissão. Tente relogar." : `Erro: ${err.message}`);
      } finally {
          setUploading(false);
      }
  };

  // --- HANDLERS FOR TEAM ---

  const handleUpdateRole = async (userId: string, newRole: 'USER' | 'ADMIN' | 'EDITOR') => {
      setRoleUpdating(userId);
      try {
          // Usamos .select() para confirmar se o registro foi REALMENTE alterado
          const { data, error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select();
          
          if (error) throw error;

          // Se o array data estiver vazio, significa que a Policy (RLS) bloqueou o update silenciosamente
          if (!data || data.length === 0) {
              throw new Error("Banco de dados recusou a alteração. Verifique se você é ADMIN no Supabase (tabela profiles).");
          }
          
          // Update local list
          setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
          alert(`Sucesso: Usuário atualizado para ${newRole}!`);
      } catch (error: any) {
          console.error("Erro ao atualizar role:", error);
          alert(`Falha: ${error.message || "Você precisa ser ADMIN para fazer isso."}`);
      } finally {
          setRoleUpdating(null);
      }
  };

  const getUploaderName = (video: any) => {
      return video.profiles?.email?.split('@')[0] || video.profiles?.email || 'Admin';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    Painel da Equipe <span className={`text-xs px-2 py-0.5 rounded font-mono ${isAdmin ? 'bg-red-600' : 'bg-blue-600'}`}>{isAdmin ? 'ADMIN' : 'EDITOR'}</span>
                </h1>
                <p className="text-gray-400">Gerenciamento de conteúdo e usuários.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${connectionStatus === 'connected' ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-red-900/30 border-red-600 text-red-400'}`}>
                    {connectionStatus === 'connected' ? <Wifi className="w-3 h-3 mr-2" /> : <WifiOff className="w-3 h-3 mr-2" />}
                    {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </div>
                <button onClick={() => { resetForm(); setIsUploadModalOpen(true); }} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-md font-bold flex items-center shadow-lg shadow-amber-900/20">
                    <Upload className="w-4 h-4 mr-2" /> Enviar Vídeo
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-slate-800 mb-6">
            <button 
                onClick={() => setActiveTab('content')}
                className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'content' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
                Conteúdo & Estatísticas
            </button>
            {isAdmin && (
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'team' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Gestão de Equipe
                </button>
            )}
        </div>

        {/* TAB CONTENT: DASHBOARD */}
        {activeTab === 'content' && (
            <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg"><Users className="w-6 h-6 text-blue-400" /></div>
                            <span className="text-xs text-green-400 font-mono">Ativos</span>
                        </div>
                        <h3 className="text-3xl font-bold">{stats.usersCount}</h3>
                        <p className="text-gray-400 text-sm">Usuários Registrados</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-amber-500/20 p-3 rounded-lg"><PlayCircle className="w-6 h-6 text-amber-400" /></div>
                            <span className="text-xs text-gray-500 font-mono">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold">{stats.videosCount}</h3>
                        <p className="text-gray-400 text-sm">Vídeos na Plataforma</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-500/20 p-3 rounded-lg"><HardDrive className="w-6 h-6 text-purple-400" /></div>
                            <span className="text-xs text-purple-400 font-mono">Otimizado</span>
                        </div>
                        <h3 className="text-3xl font-bold">Híbrido</h3>
                        <p className="text-gray-400 text-sm">YouTube + Upload</p>
                    </div>
                </div>

                {/* Recent Uploads Table */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="font-bold text-lg">Uploads Recentes</h2>
                        <button onClick={checkConnectionAndFetchData} className="text-xs text-amber-500 hover:underline">Atualizar</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-3">Vídeo</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3">Usuário</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentVideos.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum vídeo encontrado.</td></tr>
                                ) : (
                                    stats.recentVideos.map((video: any) => (
                                        <tr key={video.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <img src={video.thumbnail_url} className="w-10 h-6 object-cover rounded flex-shrink-0" alt="" />
                                                    <div className="font-medium text-white truncate max-w-[200px]">{video.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 align-middle">{video.category}</td>
                                            <td className="px-6 py-4 text-gray-400 align-middle">{video.video_url.includes('http') ? 'Link' : 'Arquivo'}</td>
                                            <td className="px-6 py-4 text-gray-400 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-3 h-3" /> {getUploaderName(video)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleEditVideo(video);
                                                        }}
                                                        className="inline-flex p-1 text-gray-400 hover:text-blue-400 bg-slate-800 hover:bg-blue-900/20 rounded transition-colors cursor-pointer relative z-10"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            confirmDeleteVideo(video.id, video.title);
                                                        }}
                                                        className="inline-flex p-1 text-gray-400 hover:text-red-400 bg-slate-800 hover:bg-red-900/20 rounded transition-colors cursor-pointer relative z-10"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )}

        {/* TAB CONTENT: TEAM MANAGEMENT */}
        {activeTab === 'team' && isAdmin && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="font-bold text-lg">Gerenciar Usuários</h2>
                        <p className="text-sm text-gray-400">Encontre usuários e atribua funções de Editor.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar por email..." 
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && checkConnectionAndFetchData()}
                            className="bg-slate-950 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-amber-500 outline-none w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3">Usuário</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Cargo Atual</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.map((u: any) => (
                                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2 align-middle">
                                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-bold text-gray-300">
                                            {u.email.charAt(0).toUpperCase()}
                                        </div>
                                        {u.id === currentUser.id && <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">Você</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 align-middle">{u.email}</td>
                                    <td className="px-6 py-4 align-middle">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${
                                            u.role === 'ADMIN' ? 'bg-red-900/30 border-red-600 text-red-400' :
                                            u.role === 'EDITOR' ? 'bg-blue-900/30 border-blue-600 text-blue-400' :
                                            'bg-slate-700 border-slate-600 text-gray-300'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right align-middle">
                                        {u.role === 'USER' && (
                                            <button 
                                                onClick={() => handleUpdateRole(u.id, 'EDITOR')}
                                                disabled={roleUpdating === u.id}
                                                className="text-blue-400 hover:text-blue-300 font-medium text-xs border border-blue-900 bg-blue-900/20 px-3 py-1 rounded hover:bg-blue-900/40 transition-colors"
                                            >
                                                {roleUpdating === u.id ? '...' : 'Promover a Editor'}
                                            </button>
                                        )}
                                        {u.role === 'EDITOR' && (
                                            <button 
                                                onClick={() => handleUpdateRole(u.id, 'USER')}
                                                disabled={roleUpdating === u.id}
                                                className="text-gray-400 hover:text-white font-medium text-xs border border-slate-700 px-3 py-1 rounded hover:bg-slate-700 transition-colors"
                                            >
                                                {roleUpdating === u.id ? '...' : 'Remover Acesso'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>

      {/* CONFIRM DELETE MODAL */}
      {videoToDelete && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-sm rounded-xl border border-slate-700 shadow-2xl p-6 transform scale-100 transition-all">
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                          <Trash2 className="w-6 h-6 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Excluir Vídeo?</h3>
                      <p className="text-gray-400 text-sm">
                          Você tem certeza que deseja remover <br/>
                          <span className="text-white font-medium">"{videoToDelete.title}"</span>?
                          <br/><br/>
                          <span className="text-xs text-gray-500">Essa ação não pode ser desfeita.</span>
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setVideoToDelete(null)}
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={handleExecuteDelete}
                          disabled={isDeleting}
                          className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition-colors flex justify-center items-center"
                      >
                          {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : 'Excluir'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* UPLOAD/EDIT MODAL */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          {editingVideoId ? <Edit className="w-5 h-5 text-amber-500" /> : <Upload className="w-5 h-5 text-amber-500" />} 
                          {editingVideoId ? 'Editar Vídeo' : 'Adicionar Novo Conteúdo'}
                      </h2>
                      <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-2">Título</label>
                                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-2">Categoria</label>
                                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white">
                                      <option>Histórias Bíblicas</option>
                                      <option>Infantil</option>
                                      <option>Estudos</option>
                                      <option>Filmes</option>
                                  </select>
                              </div>
                              {/* DURATION & PREMIUM ROW */}
                              <div>
                                  <label className="block text-sm font-medium text-gray-400 mb-2">Duração (Manual)</label>
                                  <input 
                                      type="text" 
                                      value={duration} 
                                      onChange={e => setDuration(e.target.value)} 
                                      placeholder="ex: 12m 30s"
                                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" 
                                  />
                              </div>
                              <div className="flex items-end">
                                  <button
                                      type="button"
                                      onClick={() => setIsPremium(!isPremium)}
                                      className={`w-full py-2 px-4 rounded font-bold border transition-colors flex items-center justify-center gap-2 ${isPremium ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-950 border-slate-700 text-gray-400'}`}
                                  >
                                      {isPremium ? <Shield className="w-4 h-4" /> : <Shield className="w-4 h-4 opacity-50" />}
                                      {isPremium ? 'Conteúdo Premium (Pago)' : 'Conteúdo Gratuito'}
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
                              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                          </div>
                          <div className="flex bg-slate-950 p-1 rounded-lg mb-4">
                              <button type="button" onClick={() => setUploadType('link')} className={`flex-1 py-2 text-sm font-bold rounded ${uploadType === 'link' ? 'bg-slate-800 text-white' : 'text-gray-500'}`}>Link Externo</button>
                              <button type="button" onClick={() => setUploadType('file')} className={`flex-1 py-2 text-sm font-bold rounded ${uploadType === 'file' ? 'bg-slate-800 text-white' : 'text-gray-500'}`}>Upload Arquivo</button>
                          </div>
                          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                              {uploadType === 'link' ? (
                                  <input type="url" value={youtubeLink} onChange={handleYoutubeLinkChange} placeholder="https://youtube.com/..." className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
                              ) : (
                                  <div>
                                      {editingVideoId && <p className="text-xs text-amber-500 mb-2">Atenção: Selecionar um novo arquivo substituirá o vídeo atual.</p>}
                                      <input type="file" accept="video/mp4" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:bg-amber-600 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2" />
                                  </div>
                              )}
                          </div>
                          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700 border-dashed">
                              <div className="flex justify-between mb-2">
                                  <label className="text-sm font-medium text-amber-500">Capa (Thumbnail)</label>
                                  <button type="button" onClick={generateThumbnail} disabled={isGeneratingThumb} className="text-xs bg-slate-700 px-2 py-1 rounded text-white flex gap-1"><Wand2 className="w-3 h-3"/> Gerar Auto</button>
                              </div>
                              <div className="flex gap-4">
                                  <div className="flex-1">
                                      <input type="file" accept="image/*" onChange={e => { setThumbnailFile(e.target.files?.[0] || null); setGeneratedThumbPreview(null); }} className="block w-full text-sm text-gray-400 file:bg-slate-700 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2" />
                                      {editingVideoId && !thumbnailFile && !generatedThumbPreview && (
                                          <p className="text-xs text-gray-500 mt-2">Deixe em branco para manter a capa atual.</p>
                                      )}
                                  </div>
                                  {(generatedThumbPreview) ? (
                                      <img src={generatedThumbPreview} className="w-20 h-12 object-cover rounded border border-amber-500" alt="Preview" />
                                  ) : (editingVideoId && existingThumbnailUrl && (
                                      <div className="flex flex-col items-center">
                                          <img src={existingThumbnailUrl} className="w-20 h-12 object-cover rounded border border-gray-600 opacity-50" alt="Atual" />
                                          <span className="text-[10px] text-gray-500">Atual</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                              <button type="submit" disabled={uploading} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded font-bold flex items-center">
                                  {uploading ? <Loader className="animate-spin"/> : (editingVideoId ? 'Atualizar Vídeo' : 'Salvar')}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
