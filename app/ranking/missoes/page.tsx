'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Container } from '@/components/ui/Container'
import { ArrowLeft, Shield, Trophy, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MissoesPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMissionsAndProgress()
  }, [])

  const loadMissionsAndProgress = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Busca todas as missões disponíveis
      const { data: missionsData, error: mError } = await supabase
        .from('missions')
        .select('*')
        .order('xp_reward', { ascending: false })

      if (mError) throw mError

      // 2. Busca o progresso do usuário logado nessas missões
      const { data: userMissionsData, error: umError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)

      if (umError) throw umError

      // Mapeia os progressos para facilitar o vínculo com a lista global
      const progressMap = new Map(
        userMissionsData?.map((um) => [um.mission_id, um])
      )

      // 3. Junta os dados estruturando para o front-end
      const mergedMissions = (missionsData || []).map((mission) => {
        const userProgress = progressMap.get(mission.id) as any
        const current_progress = userProgress ? userProgress.current_progress : 0
        const completed = userProgress ? userProgress.completed : false

        // Garante que a porcentagem não passe de 100%
        const percentage = Math.min(
          Math.round((current_progress / mission.target_count) * 100),
          100
        )

        return {
          ...mission,
          current_progress,
          completed,
          percentage,
        }
      })

      setMissions(mergedMissions)
    } catch (error) {
      console.error('Erro ao carregar missões:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header grudadinho idêntico ao do perfil */}
      <header className="sticky top-0 z-20 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-14">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 font-medium text-gray-900">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Missões da Comunidade</span>
            </div>
            <div className="w-8" />
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container size="small">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Central de Conquistas</h1>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Complete missões postando e interagindo no mural para subir de nível e ganhar visibilidade.
            </p>
          </div>

          {/* Grid de Missões */}
          <div className="space-y-3">
            {missions.map((mission) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${
                  mission.completed
                    ? 'bg-emerald-50/40 border-emerald-100'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={`text-sm font-bold ${mission.completed ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {mission.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{mission.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    mission.completed 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-50 border border-amber-100 text-amber-700'
                  }`}>
                    +{mission.xp_reward} XP
                  </span>
                </div>

                {/* Área de progresso ou concluído */}
                <div className="mt-4 flex items-center gap-3">
                  {mission.completed ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                      <span>Concluída</span>
                    </div>
                  ) : (
                    <>
                      {/* Barra de progresso */}
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mission.percentage}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="bg-gray-900 h-full rounded-full"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                        {mission.current_progress} / {mission.target_count}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  )
}