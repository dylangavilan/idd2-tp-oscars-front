export interface Category {
  _id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  _id: string;
  nombre: string;
  apellido: string;
  nacionalidad: string;
  roles: ProfessionalRole[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalRole {
  nombre: "Actor Principal" | "Actor Secundario" | "Director" | "Productor";
}

export interface Movie {
  _id: string;
  titulo: string;
  anioEstreno: number;
  genero: string;
  descripcion: string;
  reparto: CastMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CastMember {
  profesionalId: Professional | string;
  rol: "Actor Principal" | "Actor Secundario" | "Director" | "Productor";
}

export const CeremonyState = {
  ABIERTA: "abierta",
  CERRADA: "cerrada",
} as const;
export type CeremonyState = (typeof CeremonyState)[keyof typeof CeremonyState];

export interface Ceremony {
  _id: string;
  anio: number;
  fecha: string;
  lugar: string;
  estado: CeremonyState;
  actuaciones: Performance[];
  nominaciones: Nomination[];
  premios: Award[];
  createdAt: string;
  updatedAt: string;
}

export interface Performance {
  _id?: string;
  tipoActuacion: string;
  artistas: Artist[];
}

export interface Artist {
  nombre: string;
  tipo: "Cantante" | "Banda" | "Orquesta";
}

export interface Nomination {
  _id: string;
  categoria: CategorySnapshot;
  pelicula: MovieSnapshot | null;
  profesional: ProfessionalSnapshot | null;
  esGanador: boolean;
}

export interface Award {
  categoria: CategorySnapshot;
  nominadoGanadorId: string;
  ganador: Winner;
}

export const NomineeType = {
  PELICULA: "pelicula",
  PROFESIONAL: "profesional",
} as const;
export type NomineeType = (typeof NomineeType)[keyof typeof NomineeType];

export interface Winner {
  tipo: NomineeType;
  pelicula: MovieSnapshot | null;
  profesional: ProfessionalSnapshot | null;
}

export interface CategorySnapshot {
  id: string;
  nombre: string;
}

export interface MovieSnapshot {
  id: string;
  titulo: string;
}

export interface ProfessionalSnapshot {
  id: string;
  nombreCompleto: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  ADMIN: "ADMIN",
  ACADEMY_MEMBER: "ACADEMY_MEMBER",
  COMMON_USER: "COMMON_USER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface Vote {
  _id: string;
  userId: string;
  ceremonyId: string;
  categoryId: string;
  nominacionId: string;
  createdAt: string;
}

export interface VoteCount {
  nominacionId: string;
  votos: number;
}

// GET /votes?idCeremonia=X (new shape)
export interface VoteCountsResponse {
  ceremonia: { id: string; anio: number; lugar: string; estado: CeremonyState };
  resumen: {
    totalVotosCeremonia: number;
    totalVotosResultado: number;
    totalNominacionesConVotos: number;
    filtroCategoriaId: string | null;
  };
  resultados: {
    votos: number;
    nominacion: {
      id: string;
      categoria: CategorySnapshot;
      pelicula: MovieSnapshot | null;
      profesional: ProfessionalSnapshot | null;
      esGanador: boolean;
    };
  }[];
}

// GET /votes/me/status?idCeremonia=X
export interface VotingStatus {
  ceremonia: { id: string; anio: number; lugar: string; estado: CeremonyState };
  resumen: {
    totalCategorias: number;
    totalCategoriasVotadas: number;
    totalCategoriasPendientes: number;
    completo: boolean;
  };
  votos: {
    categoria: CategorySnapshot;
    nominacion: { id: string; pelicula: MovieSnapshot | null; profesional: ProfessionalSnapshot | null; esGanador: boolean };
    voto: { id: string; createdAt: string };
  }[];
  pendientes: CategorySnapshot[];
}

// GET /ceremonies/:id/results
export interface CeremonyResultCategory {
  categoria: CategorySnapshot;
  totalVotosCategoria: number;
  hayEmpateEnPrimerLugar: boolean;
  ganador: { id: string; pelicula: MovieSnapshot | null; profesional: ProfessionalSnapshot | null; esGanador: boolean } | null;
  nominaciones: {
    votos: number;
    nominacion: { id: string; categoria: CategorySnapshot; pelicula: MovieSnapshot | null; profesional: ProfessionalSnapshot | null; esGanador: boolean };
  }[];
}
export interface CeremonyResults {
  ceremonia: { id: string; anio: number; lugar: string; estado: CeremonyState };
  resumen: {
    totalVotosCeremonia: number;
    totalCategorias: number;
    totalCategoriasConVotos: number;
    totalCategoriasConGanador: number;
  };
  categorias: CeremonyResultCategory[];
}

// GET /ceremonies/:id/categories/:id/leaderboard
export interface LeaderboardEntry {
  posicion: number;
  votos: number;
  nominacion: { id: string; categoria: CategorySnapshot; pelicula: MovieSnapshot | null; profesional: ProfessionalSnapshot | null; esGanador: boolean };
}
export interface CategoryLeaderboard {
  ceremonia: { id: string; anio: number; lugar: string; estado: CeremonyState };
  categoria: CategorySnapshot;
  resumen: {
    totalNominaciones: number;
    totalVotosCategoria: number;
    liderActualNominacionId: string | null;
    hayEmpateEnPrimerLugar: boolean;
  };
  leaderboard: LeaderboardEntry[];
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuditLog {
  id: number;
  idUsuario: number;
  accion: string;
  entidad: string;
  detalle?: string;
  timestamp: string;
}
