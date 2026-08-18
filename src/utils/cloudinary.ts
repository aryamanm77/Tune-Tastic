// Cloud Account 1 (original)
const CLOUD_1 = "rgnz1qq3";
// Cloud Account 2 (new)
const CLOUD_2 = "dcjd0labu";

// Songs from Cloud 2 will have audioIds starting with "dcjd0labu:"
// We store them with a prefix so we can detect which cloud they came from
function getCloudName(audioId: string): string {
  if (audioId.startsWith('dcjd0labu:')) return CLOUD_2;
  return CLOUD_1;
}

function cleanAudioId(audioId: string): string {
  return audioId.replace(/^dcjd0labu:/, '');
}

export const getAudioUrl = (audioId: string) => {
  const cloud = getCloudName(audioId);
  const id = cleanAudioId(audioId);
  return `https://res.cloudinary.com/${cloud}/video/upload/${id}`;
};

export const getCoverArtUrl = (audioId: string) => {
  const cloud = getCloudName(audioId);
  const id = cleanAudioId(audioId);
  return `https://res.cloudinary.com/${cloud}/image/upload/w_500,h_500,c_fill,q_auto/${id}.jpg`;
};
