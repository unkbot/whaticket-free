import {
  proto,
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  BufferJSON
} from "@adiwajshing/baileys";
import Whatsapp from "../models/Whatsapp";
import BaileysSessions from "../models/BaileysSessions";

export const useMultiFileAuthState = async (
  whatsapp: Whatsapp
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const writeData = async (data: any, file: string) => {
    try {
      const existing = await BaileysSessions.findOne({
        where: {
          whatsappId: whatsapp.id,
          name: file
        }
      });
      if (existing) {
        await existing.update({
          value: JSON.stringify(data, BufferJSON.replacer)
        });
      } else {
        await BaileysSessions.create({
          whatsappId: whatsapp.id,
          value: JSON.stringify(data, BufferJSON.replacer),
          name: file
        });
      }
    } catch (error) {
      console.log("writeData error", error);
      return null;
    }
  };

  const readData = async (file: string) => {
    try {
      const data = await BaileysSessions.findOne({
        where: {
          whatsappId: whatsapp.id,
          name: file
        }
      });

      if (data && data.value !== null) {
        return JSON.parse(JSON.stringify(data.value), BufferJSON.reviver);
      }
      return null;
    } catch (error) {
      console.log("Read data error", error);
      return null;
    }
  };

  const removeData = async (file: string) => {
    try {
      await BaileysSessions.destroy({
        where: {
          whatsappId: whatsapp.id,
          name: file
        }
      });
    } catch (error) {
      console.log("removeData", error);
    }
  };

  const creds: AuthenticationCreds =
    (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key") {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }

              data[id] = value;
            })
          );

          return data;
        },
        set: async data => {
          const tasks: Promise<void>[] = [];
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const category in data) {
            // eslint-disable-next-line no-restricted-syntax, guard-for-in
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }

          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => {
      return writeData(creds, "creds");
    }
  };
};
