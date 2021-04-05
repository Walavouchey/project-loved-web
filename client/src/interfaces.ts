export enum DescriptionState {
  notWritten,
  written,
  reviewed,
}

export enum GameMode {
  osu,
  taiko,
  catch,
  mania,
}

export enum LogType {
  error,
  action,
  analytic,
}

export enum MetadataState {
  unchecked,
  needsChange,
  good,
}

export enum ModeratorState {
  unchecked,
  needsChange,
  good,
  notAllowed,
}

interface IGenericBeatmap {
  id: number;
  beatmapset_id: number;
  bpm: number;
  deleted_at?: Date;
  play_count: number;
  ranked_status: number;
  star_rating: number;
  version: string;
}

interface INotManiaBeatmap extends IGenericBeatmap {
  game_mode: Exclude<GameMode, GameMode.mania>;
}

interface IManiaBeatmap extends IGenericBeatmap {
  game_mode: GameMode.mania;
  key_count: number;
}

export type IBeatmap = IManiaBeatmap | INotManiaBeatmap;

export type IBeatmapWithExcluded = IBeatmap & {
  excluded: boolean;
};

export interface IBeatmapset {
  id: number;
  artist: string;
  creator_id: number;
  creator_name: string;
  favorite_count: number;
  play_count: number;
  ranked_status: number;
  submitted_at: string;
  title: string;
  updated_at: string;
}

export interface ILog {
  id: number;
  created_at: string;
  creator?: IUser;
  message: string;
  type: LogType;
}

export interface INomination {
  id: number;
  beatmaps: IBeatmapWithExcluded[];
  beatmapset: IBeatmapset;
  beatmapset_creators: IUserWithoutRoles[];
  description?: string;
  description_author?: IUser;
  description_state: DescriptionState;
  game_mode: GameMode;
  metadata_assignee?: IUser;
  metadata_state: MetadataState;
  moderator_assignee?: IUser;
  moderator_state: ModeratorState;
  nominators: IUserWithoutRoles[];
  order: number;
  overwrite_artist?: string;
  overwrite_title?: string;
  parent_id?: number;
  round_id: number;
}

export interface IPollResult {
  id: number;
  beatmapset?: IBeatmapset;
  ended_at: string;
  game_mode: GameMode;
  result_no: number;
  result_yes: number;
  round: number;
  topic_id: number;
  voting_threshold?: number;
}

export type IRole = 'captain' | 'god' | 'god_readonly' | 'metadata' | 'moderator' | 'news';

export interface IRound {
  id: number;
  done: boolean;
  game_modes: Record<GameMode, {
    nominations_locked: boolean;
    voting_threshold: number;
  }>;
  polls_ended_at?: string;
  polls_started_at?: string;
  name: string;
  news_intro?: string;
  news_intro_preview?: string;
  news_outro?: string;
  news_posted_at?: string;
}

export interface IUser {
  id: number;
  avatar_url: string;
  banned: boolean;
  country: string;
  name: string;
  roles: Record<IRole, boolean> & { captain_game_mode?: GameMode };
}

export type IUserWithoutRoles = Omit<IUser, 'roles'>;

export interface ICaptain extends IUser {
  roles: IUser['roles'] & {
    captain: true;
    captain_game_mode: GameMode;
  };
}

export type PartialWithoutId<T extends { id: unknown }> = {
  [P in keyof T as Exclude<P, 'id'>]?: T[P];
};

export type PartialWithId<T extends { id: unknown }> = { id: T['id'] } & PartialWithoutId<T>;
