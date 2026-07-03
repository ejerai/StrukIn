import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Sparkles, Shield, Flame, GraduationCap, Heart, UserCheck, Rocket, HelpCircle, CheckCircle2 } from 'lucide-react';

// 5 pertanyaan buat nentuin karakter Asisten AI yang paling cocok
const QUIZ_QUESTIONS = [
  {
    question: 'Kalau minggu ini kamu kebablasan boros, reaksi yang paling "kamu banget" gimana?',
    options: [
      { text: 'Dievaluasi baik-baik, dicari akar masalahnya, terus dibikin rencana biar gak kejadian lagi.', persona: 'Dosen Killer' },
      { text: 'Duh, kok jajan mulu sih? Inget masa depan dong, jangan boros-boros!', persona: 'Emak Bawel' },
      { text: 'Yaudah sih, namanya juga hidup. Besok diperbaiki lagi, santai aja.', persona: 'Teman Santai' },
    ],
  },
  {
    question: 'Kamu lebih nyaman dibimbing sama orang yang sifatnya...',
    options: [
      { text: 'Tegas dan disiplin, semua harus sesuai target yang jelas.', persona: 'Dosen Killer' },
      { text: 'Perhatian banget walau kadang cerewet.', persona: 'Emak Bawel' },
      { text: 'Santai, ngobrolnya kayak sama temen sendiri.', persona: 'Teman Santai' },
    ],
  },
  {
    question: 'Kalau dikritik soal cara kamu ngatur uang, kamu maunya disampaikan dengan cara...',
    options: [
      { text: 'Blak-blakan berbasis data & fakta, gak usah muter-muter.', persona: 'Dosen Killer' },
      { text: 'Diomelin, tapi jelas keliatan sayangnya.', persona: 'Emak Bawel' },
      { text: 'Santai kayak diskusi bareng temen, gak usah baper.', persona: 'Teman Santai' },
    ],
  },
  {
    question: 'Motivasi terbesar kamu buat hemat itu apa?',
    options: [
      { text: 'Target/pencapaian — gak mau gagal capai goal finansial.', persona: 'Dosen Killer' },
      { text: 'Sayang ke diri sendiri & keluarga, gak mau ngerepotin orang lain.', persona: 'Emak Bawel' },
      { text: 'Pengen tetep enjoy hidup tanpa terlalu stress mikirin uang.', persona: 'Teman Santai' },
    ],
  },
  {
    question: 'Lihat struk belanja yang isinya boros semua, reaksi pertama kamu...',
    options: [
      { text: '"Ini melanggar budget planning gue, harus dievaluasi sistematis."', persona: 'Dosen Killer' },
      { text: '"Aduh, kok bisa boros gini, jadi khawatir deh sama kamu."', persona: 'Emak Bawel' },
      { text: '"Santai aja, itung-itung self reward. Besok dikontrol lagi."', persona: 'Teman Santai' },
    ],
  },
];

export default function Onboarding({ user, isDemo, onOnboardingComplete }) {
  const [limit, setLimit] = useState(0);
  const [character, setCharacter] = useState(null);
  const [spiciness, setSpiciness] = useState('Sedang');
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(Array(QUIZ_QUESTIONS.length).fill(null));

  const allQuizAnswered = quizAnswers.every((a) => a !== null);

  // Hitung karakter yang paling cocok berdasarkan jawaban kuis
  const getRecommendedPersona = () => {
    if (!allQuizAnswered) return null;
    const tally = {};
    quizAnswers.forEach((persona) => {
      tally[persona] = (tally[persona] || 0) + 1;
    });
    return Object.keys(tally).reduce((a, b) => (tally[a] >= tally[b] ? a : b));
  };

  const recommendedPersona = getRecommendedPersona();

  // Begitu kuis selesai dijawab, otomatis pilihkan karakter rekomendasi
  // (user tetap bisa ganti manual lewat kartu di bawahnya)
  useEffect(() => {
    if (recommendedPersona) {
      setCharacter(recommendedPersona);
    }
  }, [recommendedPersona]);

  const handleQuizAnswer = (qIndex, persona) => {
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = persona;
      return next;
    });
  };

  // Format angka jadi string dengan titik (1000000 → "1.000.000")
  const formatNumber = (val) => {
    const num = val.toString().replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Ambil angka murni dari string berformat
  const parseNumber = (val) => Number(val.toString().replace(/\./g, ''));

  const handleLimitChange = (e) => {
    const raw = e.target.value.replace(/\./g, '');
    if (raw === '' || /^\d+$/.test(raw)) {
      setLimit(raw === '' ? 0 : Number(raw));
    }
  };

  const isBelowMin = limit > 0 && limit < 10000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const profileData = {
      id: user.id,
      monthly_limit: Number(limit),
      ai_character: character,
      ai_spiciness: spiciness,
    };

    if (isDemo) {
      // In demo mode, save to localStorage
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
      setLoading(false);
      onOnboardingComplete(profileData);
      return;
    }

    try {
      // Coba INSERT dulu (untuk akun baru yang belum punya profil)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (insertError) {
        // Kalau error karena duplicate (profil sudah ada), coba UPDATE
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              monthly_limit: profileData.monthly_limit,
              ai_character: profileData.ai_character,
              ai_spiciness: profileData.ai_spiciness,
            })
            .eq('id', user.id);

          if (updateError) throw updateError;
        } else {
          throw insertError;
        }
      }

      onOnboardingComplete(profileData);
    } catch (err) {
      console.error('Error saving profile onboarding:', err);
      alert('Gagal menyimpan profil ke Supabase:\n\n' + err.message + '\n\nKemungkinan penyebab:\n- Policy RLS tidak mengizinkan INSERT/UPDATE\n- Cek Supabase > Authentication > Policies');
      // Fallback ke localStorage agar UI tetap bisa berjalan
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
      onOnboardingComplete(profileData);
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    {
      name: 'Dosen Killer',
      icon: <GraduationCap size={24} color="var(--color-primary)" />,
      description: 'Formal, ketat, menuntut kedisiplinan tingkat tinggi, menganggap pengeluaran bocor alus sebagai kegagalan kelas.'
    },
    {
      name: 'Emak Bawel',
      icon: <Heart size={24} color="#ef4444" />,
      description: 'Penuh perhatian tapi cerewet setengah mati, selalu membandingkan jajanmu dengan harga kebutuhan pokok.'
    },
    {
      name: 'Teman Santai',
      icon: <UserCheck size={24} color="#3b82f6" />,
      description: 'Menggunakan bahasa santai tongkrongan, menasehati layaknya kawan tapi suka menyindir tajam kalau boros.'
    }
  ];

  const spicinessLevels = [
    {
      level: 'Manis',
      color: '#10b981',
      bg: '#d1fae5',
      desc: 'Saran logis & edukasi keuangan yang memotivasi.'
    },
    {
      level: 'Sedang',
      color: '#f59e0b',
      bg: '#fef3c7',
      desc: 'Sindiran komedi ringan & nasehat lucu.'
    },
    {
      level: 'Pedes Mampus',
      color: '#ef4444',
      bg: '#fee2e2',
      desc: 'Roasting brutal, sarkasme murni tanpa ampun.'
    }
  ];

  return (
    <div style={styles.container} className="animated-fade-in">
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>
            <Sparkles size={16} /> Setup Keuanganmu
          </div>
          <h1 style={styles.title}>Selamat Datang di StrukIn!</h1>
          <p style={styles.subtitle}>
            Ayo atur budget dan konfigurasikan asisten AI pelatih hematmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Budget Input */}
          <div className="form-group" style={styles.section}>
            <label className="form-label" style={styles.sectionTitle}>
              <Shield size={18} color="var(--color-primary)" />
              1. Berapa limit uang jajan / budget bulananmu?
            </label>
            <div style={{
              ...styles.inputContainer,
              borderColor: isBelowMin ? '#ef4444' : 'var(--border-color)',
            }}>
              <span style={styles.currencyPrefix}>Rp</span>
              <input
                type="text"
                inputMode="numeric"
                className="form-input"
                style={styles.budgetInput}
                value={limit === 0 ? '' : formatNumber(limit)}
                placeholder="0"
                onChange={handleLimitChange}
                required
              />
            </div>
            {isBelowMin ? (
              <p style={{ ...styles.helpText, color: '#ef4444', fontWeight: '600' }}>
                ⚠️ Budget terlalu kecil! Minimal Rp 10.000 ya.
              </p>
            ) : (
              <p style={styles.helpText}>
                Limit ini akan menjadi acuan sisa saldo dan tingkat "Survival Score" kamu.
              </p>
            )}
          </div>

          {/* AI Character Quiz */}
          <div className="form-group" style={styles.section}>
            <label className="form-label" style={styles.sectionTitle}>
              <HelpCircle size={18} color="var(--color-primary)" />
              2. Jawab 5 Pertanyaan untuk Menentukan Karakter Asisten AI-mu
            </label>
            <p style={{ ...styles.helpText, marginTop: '-10px', marginBottom: '16px' }}>
              Jawab sejujurnya ya, biar karakter asisten AI-nya paling pas sama gaya kamu.
            </p>

            <div style={styles.quizList}>
              {QUIZ_QUESTIONS.map((q, qIndex) => (
                <div key={qIndex} style={styles.quizBlock}>
                  <p style={styles.quizQuestion}>{qIndex + 1}. {q.question}</p>
                  <div style={styles.quizOptions}>
                    {q.options.map((opt, oIndex) => {
                      const selected = quizAnswers[qIndex] === opt.persona;
                      return (
                        <div
                          key={oIndex}
                          onClick={() => handleQuizAnswer(qIndex, opt.persona)}
                          style={{
                            ...styles.quizOptionBtn,
                            borderColor: selected ? 'var(--color-primary)' : 'var(--border-color)',
                            backgroundColor: selected ? 'var(--color-primary-light)' : 'transparent',
                          }}
                        >
                          <span style={{
                            ...styles.quizRadio,
                            borderColor: selected ? 'var(--color-primary)' : 'var(--border-color)',
                            backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
                          }} />
                          <span style={styles.quizOptionText}>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Hasil kuis */}
            {allQuizAnswered && (
              <div style={styles.resultCard} className="animated-fade-in">
                <div style={styles.resultHeader}>
                  <CheckCircle2 size={20} color="var(--color-primary)" />
                  <strong style={styles.resultTitle}>
                    Karakter Asisten AI Roasting kamu: {recommendedPersona}
                  </strong>
                </div>
                <p style={styles.resultDesc}>
                  {personas.find((p) => p.name === recommendedPersona)?.description}
                </p>
                <p style={styles.resultQuestion}>
                  Apakah karakter ini cocok untukmu? Kalau mau, kamu masih bisa pilih karakter lain di bawah ini 👇
                </p>
              </div>
            )}

            {allQuizAnswered && (
              <div style={styles.personaGrid}>
                {personas.map((p) => (
                  <div
                    key={p.name}
                    style={{
                      ...styles.personaCard,
                      borderColor: character === p.name ? 'var(--color-primary)' : 'var(--border-color)',
                      backgroundColor: character === p.name ? 'var(--color-primary-light)' : 'transparent'
                    }}
                    onClick={() => setCharacter(p.name)}
                  >
                    {p.name === recommendedPersona && (
                      <span style={styles.recommendedBadge}>✨ Rekomendasi</span>
                    )}
                    <div style={styles.personaHeader}>
                      <span style={styles.personaIcon}>{p.icon}</span>
                      <strong style={styles.personaName}>{p.name}</strong>
                    </div>
                    <p style={styles.personaDesc}>{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spiciness Level */}
          <div className="form-group" style={styles.section}>
            <label className="form-label" style={styles.sectionTitle}>
              <Flame size={18} color="var(--color-primary)" />
              3. Pilih Level Kepedasan Roasting
            </label>
            <div style={styles.spicyContainer}>
              {spicinessLevels.map((s) => (
                <div
                  key={s.level}
                  style={{
                    ...styles.spicyCard,
                    borderColor: spiciness === s.level ? s.color : 'var(--border-color)',
                    backgroundColor: spiciness === s.level ? s.bg : 'transparent',
                    color: spiciness === s.level ? s.color : 'var(--text-main)'
                  }}
                  onClick={() => setSpiciness(s.level)}
                >
                  <div style={styles.spicyHeader}>
                    <strong style={{ fontWeight: '800' }}>{s.level}</strong>
                  </div>
                  <p style={{ ...styles.spicyDesc, color: spiciness === s.level ? 'inherit' : 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              ...styles.submitBtn,
              opacity: (loading || isBelowMin || limit === 0 || !character) ? 0.6 : 1,
              cursor: (loading || isBelowMin || limit === 0 || !character) ? 'not-allowed' : 'pointer',
            }}
            disabled={loading || isBelowMin || limit === 0 || !character}
          >
            {loading ? 'Menyimpan Pengaturan...' : !character ? (
              <span>Jawab kuis karakter dulu ya ☝️</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Mulai Petualangan Hemat <Rocket size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 0',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '40px',
    maxWidth: '680px',
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary-dark)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '10px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '24px',
    marginBottom: '8px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '16px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: '16px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  budgetInput: {
    paddingLeft: '44px',
    fontSize: '20px',
    fontWeight: '700',
    width: '100%',
  },
  helpText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  personaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
  '@media (min-width: 600px)': {
    personaGrid: {
      gridTemplateColumns: '1fr 1fr 1fr',
    }
  },
  personaCard: {
    position: 'relative',
    border: '2px solid',
    borderRadius: 'var(--border-radius-md)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '12px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  quizList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px',
  },
  quizBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  quizQuestion: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  quizOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quizOptionBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    border: '2px solid',
    borderRadius: 'var(--border-radius-md)',
    padding: '10px 14px',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  quizRadio: {
    flexShrink: 0,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid',
    marginTop: '2px',
  },
  quizOptionText: {
    fontSize: '13px',
    color: 'var(--text-main)',
    lineHeight: '1.5',
  },
  resultCard: {
    backgroundColor: 'var(--color-primary-light)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '16px 18px',
    marginBottom: '20px',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  resultTitle: {
    fontSize: '15px',
    color: 'var(--text-main)',
  },
  resultDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '10px',
  },
  resultQuestion: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-primary-dark)',
    margin: 0,
  },
  personaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  personaIcon: {
    fontSize: '24px',
  },
  personaName: {
    fontSize: '15px',
  },
  personaDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  spicyContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  spicyCard: {
    border: '2px solid',
    borderRadius: 'var(--border-radius-md)',
    padding: '14px 20px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  spicyHeader: {
    fontSize: '15px',
  },
  spicyDesc: {
    fontSize: '13px',
    textAlign: 'right',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
  }
};
