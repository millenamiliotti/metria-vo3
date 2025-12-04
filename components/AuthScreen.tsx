import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { Lock, Mail, User as UserIcon, Building, ArrowRight, CheckCircle, Phone, MapPin, Briefcase, Globe } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'complete-profile';

// --- DATA CONSTANTS FOR STANDARDIZATION ---

const JOB_ROLES = [
  "CEO / Fundador",
  "CTO / Diretor de Tecnologia",
  "CFO / Diretor Financeiro",
  "Diretor(a) de Inovação",
  "Gerente de Inovação / R&D",
  "Gerente de Projetos / PMO",
  "Product Manager / Owner",
  "Analista de Inovação",
  "Analista de Negócios",
  "Consultor(a) Externo",
  "Investidor(a) / VC",
  "Pesquisador(a)",
  "Outro"
];

const COUNTRIES = ["Brasil", "Portugal", "Estados Unidos", "Outro"];

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Mapping simplified for MVP (Capitals + Major Hubs)
const CITIES_BY_STATE: Record<string, string[]> = {
  "SP": ["São Paulo", "Campinas", "Guarulhos", "São Bernardo do Campo", "Santo André", "Osasco", "Sorocaba", "Ribeirão Preto", "São José dos Campos", "Santos", "Barueri"],
  "RJ": ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Petrópolis", "Volta Redonda"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Uberaba"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria"],
  "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó"],
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda"],
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte"],
  "DF": ["Brasília"],
  "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis"],
  "ES": ["Vitória", "Vila Velha", "Serra"],
  "AM": ["Manaus"],
  // Default fallback for other states (Just Capital/Generic)
  "AC": ["Rio Branco"], "AL": ["Maceió"], "AP": ["Macapá"], 
  "MA": ["São Luís"], "MT": ["Cuiabá"], "MS": ["Campo Grande"], 
  "PA": ["Belém"], "PB": ["João Pessoa"], "PI": ["Teresina"], 
  "RN": ["Natal"], "RO": ["Porto Velho"], "RR": ["Boa Vista"], 
  "SE": ["Aracaju"], "TO": ["Palmas"]
};

const AuthScreen: React.FC<Props> = ({ onLogin }) => {
  const { addToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Specific state to hold Google Avatar if provided
  const [googleAvatar, setGoogleAvatar] = useState<string | undefined>(undefined);
  
  // Validation State
  const [emailError, setEmailError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: '',
    jobTitle: '', // Default empty, forces selection
    city: '',
    state: '',
    country: 'Brasil'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Real-time Email Validation
    if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            setEmailError('Formato de e-mail inválido');
        } else {
            setEmailError('');
        }
    }

    // Logic for State change -> Reset City
    if (name === 'state') {
        setFormData(prev => ({ ...prev, state: value, city: '' }));
        return;
    }

    // Logic for Country change -> Reset State/City if not Brasil
    if (name === 'country') {
        setFormData(prev => ({ 
            ...prev, 
            country: value, 
            state: value === 'Brasil' ? '' : prev.state, // Reset state if switching back to Brazil to force selection
            city: '' 
        }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError) {
        addToast('Por favor, corrija os erros no formulário.', 'warning');
        return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (mode === 'login') {
        response = await authService.login(formData.email, formData.password);
        addToast(`Bem-vindo de volta, ${response.user.name}!`, 'success');
        onLogin(response.user);
      } 
      else if (mode === 'register' || mode === 'complete-profile') {
        // Validation for extended fields
        if (!formData.name || !formData.company || !formData.phone || !formData.jobTitle || !formData.city || !formData.state) {
            throw new Error("Por favor, preencha todos os campos obrigatórios.");
        }

        // Register new user (works for both direct and google completion)
        response = await authService.register({
            name: formData.name,
            email: formData.email,
            password: mode === 'register' ? formData.password : undefined,
            company: formData.company,
            phone: formData.phone,
            jobTitle: formData.jobTitle,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            avatar: googleAvatar // Persist the Google Avatar
        });
        
        addToast('Cadastro completo com sucesso!', 'success');
        onLogin(response.user);
      }

    } catch (err: any) {
      addToast(err.message || 'Ocorreu um erro inesperado.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // 1. Get Google Data
      const googleUser = await authService.getGoogleUserObj();
      
      // 2. Check if user exists in our DB
      const existingUser = authService.checkUserExists(googleUser.email);

      if (existingUser) {
          // Login directly
          const session = authService.createSession(existingUser);
          addToast(`Login com Google realizado com sucesso!`, 'success');
          onLogin(session.user);
      } else {
          // 3. New User -> Switch to Complete Profile
          setFormData(prev => ({
              ...prev,
              name: googleUser.name,
              email: googleUser.email,
              password: '' // No password needed
          }));
          setGoogleAvatar(googleUser.avatar); // Capture Avatar
          
          // Clear any previous email errors since Google email is valid
          setEmailError('');
          
          setMode('complete-profile');
          addToast('Conta Google detectada. Por favor, complete seu cadastro.', 'info');
      }
    } catch (err) {
      addToast('Erro ao conectar com Google.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Reset basic form if switching between login/register manually
    if (newMode !== 'complete-profile') {
        setFormData(prev => ({ ...prev, password: '' }));
        setGoogleAvatar(undefined);
        setEmailError('');
    }
  };

  // Google Icon SVG
  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  // Helper to get available cities
  const availableCities = formData.country === 'Brasil' && formData.state 
      ? CITIES_BY_STATE[formData.state] || []
      : [];

  const inputStyles = "w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none transition disabled:bg-slate-100 bg-white text-slate-800 text-sm";
  const labelStyles = "text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-xl shadow-lg mb-4">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Metria</h1>
          <p className="text-slate-500 mt-2">O seu Laboratório de Inteligência para Contabilidade da Inovação na sua empresa</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
          {/* Header Tabs */}
          {mode !== 'complete-profile' && (
            <div className="flex text-sm font-medium border-b border-slate-100">
                <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-4 text-center transition ${
                    mode === 'login' ? 'text-slate-900 border-b-2 border-yellow-500 font-bold bg-slate-50' : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                Entrar
                </button>
                <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-4 text-center transition ${
                    mode === 'register' ? 'text-slate-900 border-b-2 border-yellow-500 font-bold bg-slate-50' : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                Criar Conta
                </button>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                {mode === 'login' && 'Acesse sua conta'}
                {mode === 'register' && 'Comece a inovar hoje'}
                {mode === 'complete-profile' && 'Complete seu Cadastro'}
                </h2>
                {mode === 'complete-profile' && googleAvatar && (
                    <img src={googleAvatar} alt="Google Avatar" className="w-12 h-12 rounded-full border-2 border-yellow-500 shadow-sm" title="Foto recebida do Google" />
                )}
            </div>

            {/* Google Login Button */}
            {mode !== 'complete-profile' && (
                <>
                    <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full bg-white text-slate-700 font-bold py-3 rounded-lg border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center shadow-sm mb-6 disabled:opacity-70"
                    >
                    {isGoogleLoading ? (
                        <span className="animate-pulse text-sm">Conectando...</span>
                    ) : (
                        <>
                        <GoogleIcon />
                        <span className="text-sm">Entrar com Google</span>
                        </>
                    )}
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wide font-bold">
                            <span className="bg-white px-2 text-slate-400">ou continue com email</span>
                        </div>
                    </div>
                </>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* === REGISTRATION / COMPLETION FIELDS (GRID LAYOUT) === */}
              {(mode === 'register' || mode === 'complete-profile') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 animate-fade-in mb-6">
                    {/* Name - Full Width */}
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={inputStyles}
                                placeholder="Ex: João Silva"
                                required
                                disabled={mode === 'complete-profile'} 
                            />
                        </div>
                    </div>

                    {/* Phone - Half */}
                    <div>
                        <label className={labelStyles}>Telefone</label>
                        <div className="relative">
                            <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={inputStyles}
                                placeholder="+55 11 99999-9999"
                                required
                            />
                        </div>
                    </div>

                    {/* Job Title - Half */}
                    <div>
                        <label className={labelStyles}>Cargo</label>
                        <div className="relative">
                            <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <select
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                className={inputStyles}
                                required
                            >
                                <option value="">Selecione...</option>
                                {JOB_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Company - Full Width */}
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Nome da Empresa</label>
                        <div className="relative">
                            <Building className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className={inputStyles}
                                placeholder="Ex: Startup X Ltda"
                                required
                            />
                        </div>
                    </div>

                     {/* Country - Half */}
                     <div>
                        <label className={labelStyles}>País</label>
                        <div className="relative">
                            <Globe className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className={inputStyles}
                            >
                                {COUNTRIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                     {/* State (UF) - Half */}
                     <div>
                        <label className={labelStyles}>Estado (UF)</label>
                        {formData.country === 'Brasil' ? (
                            <div className="relative">
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className={`${inputStyles} pl-4`} 
                                    required
                                >
                                    <option value="">UF</option>
                                    {BRAZIL_STATES.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className={`${inputStyles} pl-4`}
                                placeholder="Estado/Província"
                                required
                            />
                        )}
                    </div>

                    {/* City - Full Width */}
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Cidade</label>
                        <div className="relative">
                            <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            
                            {formData.country === 'Brasil' && availableCities.length > 0 ? (
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    disabled={!formData.state}
                                    className={inputStyles}
                                    required
                                >
                                    <option value="">{formData.state ? 'Selecione a cidade...' : 'Selecione UF primeiro'}</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                    <option value="Outra">Outra</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className={inputStyles}
                                    placeholder="Nome da Cidade"
                                    required
                                />
                            )}
                        </div>
                    </div>
                </div>
              )}

              {/* === CREDENTIALS (EMAIL / PASSWORD) === */}
              <div className="space-y-5">
                <div>
                    <label className={labelStyles}>Email Corporativo</label>
                    <div className="relative">
                    <Mail className={`w-5 h-5 absolute left-3 top-3 ${emailError ? 'text-red-500' : 'text-slate-400'}`} />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition disabled:bg-slate-100 bg-white text-sm ${
                            emailError 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                                : 'border-slate-300 focus:ring-2 focus:ring-yellow-500'
                        }`}
                        placeholder="voce@empresa.com"
                        required
                        disabled={mode === 'complete-profile'} 
                    />
                    </div>
                    {emailError && (
                        <p className="text-xs text-red-500 font-bold mt-1 ml-1">{emailError}</p>
                    )}
                </div>

                {/* === PASSWORD === */}
                {mode !== 'complete-profile' && (
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Senha</label>
                            {mode === 'login' && (
                                <a href="#" onClick={(e) => { e.preventDefault(); addToast('Funcionalidade indisponível no MVP.', 'info'); }} className="text-xs text-yellow-600 font-bold hover:underline">Esqueceu a senha?</a>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={inputStyles}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading || !!emailError}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-8 disabled:opacity-70 group shadow-lg shadow-slate-900/10"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  <>
                    <span className="group-hover:text-yellow-400 transition-colors">
                        {mode === 'login' && 'Entrar no Dashboard'}
                        {mode === 'register' && 'Criar Conta Gratuita'}
                        {mode === 'complete-profile' && 'Finalizar Cadastro'}
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
             {mode === 'complete-profile' ? (
                 <p className="text-sm text-slate-600">
                    Deseja usar outra conta? <button onClick={() => switchMode('login')} className="text-yellow-600 font-bold hover:underline">Cancelar</button>
                 </p>
             ) : mode === 'login' ? (
                <p className="text-sm text-slate-600">
                    Não tem conta? <button onClick={() => switchMode('register')} className="text-yellow-600 font-bold hover:underline">Cadastre-se</button>
                </p>
            ) : (
                <p className="text-sm text-slate-600">
                    Já possui conta? <button onClick={() => switchMode('login')} className="text-yellow-600 font-bold hover:underline">Faça Login</button>
                </p>
            )}
          </div>
        </div>
        
        {/* Social Proof / MVP Badge */}
        <div className="mt-8 flex justify-center gap-6 text-slate-400 text-sm">
           <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500"/> Dados Criptografados</div>
           <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500"/> MVP Seguro</div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;