import axios from "axios";
import { Form } from "semantic-ui-react";

const uploadPic = async (media) => {
  try {
    const form = new FormData();
    form.append("file", media);
    form.append("upload_preset", "FaceBook"); //name of upload preset on cloudinary
    form.append("cloud_name", "dox91cpom");

    const res = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, form);
    return res.data.url; //url of uploaded image
  } catch (error) {
    return;
  }
};

export default uploadPic;
