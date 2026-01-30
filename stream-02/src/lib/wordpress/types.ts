// Argo Note - Stream 02 WordPress Type Definitions

export type WPPostStatus = 'publish' | 'draft' | 'pending' | 'private' | 'trash';

export type WPPostRequest = {
  title: string;
  content: string;
  status: WPPostStatus;
  slug?: string;
  excerpt?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
};

export type WPPostResponse = {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: WPPostStatus;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
};

export type WPMediaUploadResponse = {
  id: number;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    file: string;
  };
};

export type WPClientOptions = {
  baseUrl: string;
  applicationPassword: string;
  username: string;
};
