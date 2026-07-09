'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Upload, Trash2, Save, Music, Edit3, Image, Lock, Camera, FileAudio, LogOut, Palette, Link } from 'lucide-react';
import { ThemeName } from '@/lib/themes';

interface AdminPanelProps {
  photos: any[];
  aboutText: string;
  musicFile: string;
  logoUrl: string;
  theme: ThemeName;
  onPhotoUpload: (file: File, title: string) => void;
  onPhotoDelete: (id: string) => void;
  onAboutSave: (text: string) => void;
  onMusicUpload: (file: File) => void;
  onMusicUrl: (url: string) => void;
  onLogoUpload: (file: File) => void;
  onThemeChange: (theme: ThemeName) => void;
}

export function AdminPanel({
  photos,
  aboutText,
  musicFile,
  logoUrl,
  theme,
  onPhotoUpload,
  onPhotoDelete,
  onAboutSave,
  onMusicUpload,
  onMusicUrl,
  onLogoUpload,
  onThemeChange,
}: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'logo' | 'about' | 'music' | 'theme'>('photos');
  const [newTitle, setNewTitle] = useState('');
  const [editAbout, setEditAbout] = useState(aboutText);
  const [musicUrlInput, setMusicUrlInput] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleLogin = () => {
    if (password === 'lipe2024') {
      setIsAuthenticated(true);
      setEditAbout(aboutText);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onPhotoUpload(file, newTitle);
    setNewTitle('');
    setUploading(false);
    setMessage('Foto adicionada com sucesso!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleMusicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onMusicUpload(file);
    setUploading(false);
    setMessage('Música atualizada!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleMusicUrlSave = () => {
    if (musicUrlInput.trim()) {
      onMusicUrl(musicUrlInput.trim());
      setMusicUrlInput('');
      setMessage('Link da música salvo!');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onLogoUpload(file);
    setUploading(false);
    setMessage('Logo atualizada!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleSaveAbout = () => {
    onAboutSave(editAbout);
    setMessage('Texto salvo!');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleDeletePhoto = (id: string) => {
    onPhotoDelete(id);
    setMessage('Foto removida.');
    setTimeout(() => setMessage(''), 2500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const themesList = [
    { name: 'black' as ThemeName, color: 'bg-zinc-900', label: 'Black', dot: 'bg-white' },
    { name: 'rose' as ThemeName, color: 'bg-rose-950', label: 'Rose', dot: 'bg-rose-400' },
    { name: 'green' as ThemeName, color: 'bg-emerald-950', label: 'Verde', dot: 'bg-emerald-400' },
    { name: 'blue' as ThemeName, color: 'bg-blue-950', label: 'Azul', dot: 'bg-blue-400' },
    { name: 'violet' as ThemeName, color: 'bg-violet-950', label: 'Violeta', dot: 'bg-violet-400' },
  ];

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 sm:w-10 sm:h-10 sm:bottom-6 sm:left-6 sm:right-auto rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center opacity-50 hover:opacity-100 active:opacity-100 transition-all duration-300 shadow-xl"
        title="Painel Administrativo"
      >
        <Settings className="w-5 h-5 sm:w-4 sm:h-4 text-text-primary" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center sm:p-6"
          >
            <motion.div
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full sm:max-w-2xl sm:max-h-[85vh] sm:h-auto bg-[#0D0D0D] border-0 sm:border border-white/[0.08] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-text-primary" />
                  </div>
                  <div>
                    <h2 className="text-text-primary font-display text-lg sm:text-xl leading-none">Lipe Photos</h2>
                    <p className="text-text-muted text-[10px] sm:text-xs mt-1">Painel de Administração</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {isAuthenticated && (
                    <button onClick={handleLogout} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors text-[10px] sm:text-xs">
                      <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Sair</span>
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="p-6 sm:p-12 flex flex-col items-center justify-center flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-5 sm:mb-6">
                    <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-text-muted" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display text-text-primary mb-2">Área Restrita</h3>
                  <p className="text-text-secondary text-xs sm:text-sm mb-6 sm:mb-8 text-center max-w-sm px-4">Digite sua senha para acessar o painel de controle do seu site.</p>
                  <div className="w-full max-w-xs space-y-3 px-4">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="Digite sua senha"
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all text-center"
                    />
                    <button onClick={handleLogin} className="w-full px-5 py-3.5 bg-white text-black rounded-2xl font-medium text-sm hover:bg-white/90 transition-all active:scale-[0.98]">
                      Entrar no Painel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex px-3 sm:px-6 pt-3 sm:pt-4 gap-1 overflow-x-auto flex-shrink-0 scrollbar-hide">
                    {[
                      { id: 'photos', icon: Image, label: 'Fotos' },
                      { id: 'logo', icon: Camera, label: 'Logo' },
                      { id: 'about', icon: Edit3, label: 'Sobre' },
                      { id: 'music', icon: FileAudio, label: 'Música' },
                      { id: 'theme', icon: Palette, label: 'Tema' },
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id as any)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                          activeTab === id ? 'bg-white/[0.06] text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.02]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {message && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-3 sm:mx-6 mt-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs sm:text-sm flex items-center gap-2 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-3 sm:p-6 overflow-y-auto flex-1">
                    {activeTab === 'photos' && (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3 sm:space-y-4">
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm flex items-center gap-2">
                            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Adicionar Nova Foto
                          </h3>
                          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título da foto (opcional)" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-white/20 transition-all" />
                          <label className="block w-full px-3 sm:px-4 py-4 sm:py-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-dashed text-text-muted text-xs sm:text-sm text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all">
                            {uploading ? (
                              <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />Enviando...</span>
                            ) : (
                              <><Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />Clique para escolher uma foto<br /><span className="text-[10px] sm:text-xs text-text-muted mt-1">JPG, PNG ou WebP</span></>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                          </label>
                        </div>
                        <div>
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm mb-3 sm:mb-4">Minhas Fotos ({photos.length})</h3>
                          {photos.length === 0 ? (
                            <div className="text-center py-10 sm:py-12 text-text-muted">
                              <Image className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                              <p className="text-xs sm:text-sm">Nenhuma foto adicionada ainda.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                              {photos.map((photo) => (
                                <div key={photo.id} className="relative group rounded-lg sm:rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04]">
                                  <img src={photo.image} alt={photo.title} className="w-full aspect-square object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeletePhoto(photo.id)} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500 transition-colors"><Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
                                    <p className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 text-white text-[10px] sm:text-xs font-medium truncate">{photo.title}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'logo' && (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm flex items-center gap-2"><Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Logo do Site</h3>
                          <div className="flex justify-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/[0.03] border-2 border-white/[0.08]">
                              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px] sm:text-xs">Sem logo</div>}
                            </div>
                          </div>
                          <label className="block w-full px-3 sm:px-4 py-4 sm:py-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-dashed text-text-muted text-xs sm:text-sm text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all">
                            {uploading ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />Enviando...</span> : <><Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />Escolher imagem para logo<br /><span className="text-[10px] sm:text-xs text-text-muted mt-1">Recomendado: quadrada</span></>}
                            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={uploading} />
                          </label>
                        </div>
                      </div>
                    )}

                    {activeTab === 'about' && (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm flex items-center gap-2"><Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Editar Texto da Seção Sobre</h3>
                          <textarea value={editAbout} onChange={(e) => setEditAbout(e.target.value)} rows={8} placeholder="Escreva seu texto aqui..." className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-white/20 transition-all resize-none leading-relaxed" />
                          <button onClick={handleSaveAbout} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-black rounded-xl font-medium text-xs sm:text-sm hover:bg-white/90 transition-all active:scale-[0.98]"><Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Salvar Alterações</button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'music' && (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm flex items-center gap-2"><Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Upload de Música</h3>
                          <label className="block w-full px-3 sm:px-4 py-4 sm:py-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-dashed text-text-muted text-xs sm:text-sm text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all">
                            {uploading ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />Enviando...</span> : <><Music className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />Upload de arquivo MP3</>}
                            <input type="file" accept="audio/mpeg,audio/mp3" onChange={handleMusicChange} className="hidden" disabled={uploading} />
                          </label>
                        </div>

                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm flex items-center gap-2"><Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Ou cole um link (ideal pra iPhone)</h3>
                          <p className="text-text-muted text-[10px] sm:text-xs">Cole o link direto de um MP3 (ex: Dropbox, Google Drive, etc)</p>
                          <input type="text" value={musicUrlInput} onChange={(e) => setMusicUrlInput(e.target.value)} placeholder="https://exemplo.com/musica.mp3" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-white/20 transition-all" />
                          <button onClick={handleMusicUrlSave} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-black rounded-xl font-medium text-xs sm:text-sm hover:bg-white/90 transition-all active:scale-[0.98]"><Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Salvar Link</button>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <p className="text-text-muted text-[10px] sm:text-xs mb-1">Música atual:</p>
                          <p className="text-text-primary text-xs sm:text-sm truncate">{musicFile || 'Nenhuma'}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'theme' && (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                          <h3 className="text-text-primary font-medium text-xs sm:text-sm flex items-center gap-2"><Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Escolher Tema</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {themesList.map((t) => (
                              <button
                                key={t.name}
                                onClick={() => onThemeChange(t.name)}
                                className={`p-4 rounded-xl ${t.color} border-2 transition-all hover:scale-105 active:scale-95 ${theme === t.name ? 'border-white' : 'border-white/10'}`}
                              >
                                <div className={`w-4 h-4 rounded-full ${t.dot} mx-auto mb-2`} />
                                <p className="text-white text-xs sm:text-sm font-medium">{t.label}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0 mt-auto">
                    <p className="text-text-muted text-[10px] sm:text-xs">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
                    <button onClick={() => setIsOpen(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors text-[10px] sm:text-xs">Fechar Painel</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}