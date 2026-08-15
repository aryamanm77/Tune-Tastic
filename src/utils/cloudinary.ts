const CLOUD_NAME = "rgnz1qq3";

export const getAudioUrl = (audioId: string) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${audioId}`;
};

export const getCoverArtUrl = (audioId: string) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_500,h_500,c_fill,q_auto/${audioId}.jpg`;
};
