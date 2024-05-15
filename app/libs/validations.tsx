// Validation function for name
export const validateName = (name: string) => {
  const nameRegEx = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
  return nameRegEx.test(name);
};

// Validation function for phone number
export const validatePhoneNumber = (phonenumber: string) => {
  const phoneNumberRegEx = /^\d{3}-\d{3}-\d{4}$/;
  return phoneNumberRegEx.test(phonenumber);
};

// Validation function for image
export const validateImage = (imageBase64: string) => {
  // Check if the base64 string contains common image file extensions
  const validExtensions = [".jpg", ".jpeg", ".png"];
  const regex = /^data:image\/(jpeg|jpg|png);base64,/;

  if (regex.test(imageBase64)) {
    const extension = imageBase64.match(regex)![1];
    if (validExtensions.includes(`.${extension}`)) {
      return true; // Valid image format
    }
  }

  return false; // Invalid image format
};

export const validateEmail = (email: string) => {
  const emailRegEx = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;
  return emailRegEx.test(email);
};

export const validatePassword = (password: string) => {
  const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegEx.test(password);
};
