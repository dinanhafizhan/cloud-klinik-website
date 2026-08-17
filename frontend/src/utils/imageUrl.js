export const getImageUrl = (foto) => {
  if (!foto) return "/default-foto.png";
  if (foto.startsWith("http://") || foto.startsWith("https://")) {
    return foto;
  }
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  return `${apiUrl}/images/${foto}`;
};

export default getImageUrl;
