import axios from "axios";
import FormData from "form-data";

const formData: FormData = new FormData();

const apiBase = axios.create({
  baseURL: "https://graph.facebook.com/",
  params: {
    access_token: process.env.PAGE_ACCESS_TOKEN
  }
});

export const getAccessToken = async (): Promise<string> => {
  const { data } = await axios.get(
    "https://graph.facebook.com/v6.0/oauth/access_token",
    {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        grant_type: "client_credentials"
      }
    }
  );

  return data.access_token;
};

export const markSeen = async (id: string): Promise<void> => {
  await apiBase.post(`${id}/messages`, {
    recipient: {
      id
    },
    sender_action: "mark_seen"
  });
};

export const sendText = async (id: string, text: string): Promise<void> => {
  try {
    await apiBase.post("/v11.0/me/messages", {
      recipient: {
        id
      },
      message: {
        text: `${text}`
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendAttachment = async (
  id: string,
  file: unknown,
  type: string
): Promise<void> => {
  formData.append(
    "recipient",
    JSON.stringify({
      id
    })
  );

  formData.append(
    "message",
    JSON.stringify({
      attachment: {
        type,
        payload: {
          is_reusable: true
        }
      }
    })
  );

  formData.append("filedata", file);

  try {
    await apiBase.post("/v11.0/me/messages", formData, {
      headers: formData.getHeaders()
    });
  } catch (error) {
    console.log(error);
  }
};

export const genText = (text: string): any => {
  const response = {
    text
  };

  return response;
};

export const getProfile = async (id: string): Promise<any> => {
  try {
    const { data } = await apiBase.get(id);

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
  }
};
