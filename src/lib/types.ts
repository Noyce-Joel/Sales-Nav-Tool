export type Profile = {
  id: number;
  name: string | null;
  url: string | null;
  company: string | null;
  location: string | null;
  title: string | null;
  connections: Connection[] | null;
  recents: Connection[] | null;
  reviewed: Date | string | null;
  time: number;
  sessionCookie: string;
};

export type Connection = {
  name: string | null;
  picture: string | null;
  leadId: string | null;
  linkedinUrl: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
};

export type FormData = {
  profileUrl: string;
  picture: string;
  name: string;
  location: string;
  company: string;
  title: string;
  sessionCookie: string;
};

export type WatchList = {
  name: string | null;
  company?: string | null;
  salesNavigatorUrl: string | null;
  elapsedTime: number | null;
  lastSearch: string | null;
};
