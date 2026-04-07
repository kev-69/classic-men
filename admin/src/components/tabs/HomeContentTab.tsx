import type { FormEvent } from "react";

type HomeContentTabProps = {
  isLoading: boolean;
  landingVideoUrl: string;
  storyImageUrl: string;
  updatedAt: string | null;
  onChangeLandingVideoUrl: (value: string) => void;
  onChangeStoryImageUrl: (value: string) => void;
  onUploadLandingVideo: (file: File | null) => void;
  onUploadStoryImage: (file: File | null) => void;
  onSave: (event: FormEvent) => void;
};

export function HomeContentTab({
  isLoading,
  landingVideoUrl,
  updatedAt,
  onChangeLandingVideoUrl,
  onUploadLandingVideo,
  onSave
}: HomeContentTabProps) {
  return (
    <section className="panel home-content-panel">
      <h2>Home Content</h2>
      <p className="analytics-note">Update the landing video and story image displayed on the Home page.</p>

      <form className="home-content-grid" onSubmit={onSave}>
        <label>
          Landing Video URL
          <input
            type="url"
            placeholder="https://res.cloudinary.com/.../video/upload/...mp4"
            value={landingVideoUrl}
            onChange={(event) => onChangeLandingVideoUrl(event.target.value)}
          />
        </label>

        <label className="upload-field">
          Or upload landing video
          <input type="file" accept="video/*" onChange={(event) => onUploadLandingVideo(event.target.files?.[0] ?? null)} />
        </label>

        <button type="submit" disabled={isLoading}>
          Save Home Content
        </button>
      </form>

      <small>Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Never"}</small>
    </section>
  );
}
