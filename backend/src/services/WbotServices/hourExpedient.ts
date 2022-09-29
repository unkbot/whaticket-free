import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";

const hourExpedient = async () => {
  const data = new Date();
  const weekDay = new Date().toLocaleDateString("en-US", {
    weekday: "long"
  });
  const hora = data.getHours();
  const min = data.toLocaleString("en-US", { minute: "2-digit" });
  const horaAtual = `${(hora < 10 ? "0" : "") + hora}:${min}`;
  const workHour = await ListWhatsAppsService();
  const weekDays: string[] = [];
  let resulta = "";

  workHour.map(value => {
    {
      value.monday ? weekDays.push("Monday") : "";
    }
    {
      value.tuesday ? weekDays.push("Tuesday") : "";
    }
    {
      value.wednesday ? weekDays.push("Wednesday") : "";
    }
    {
      value.thursday ? weekDays.push("Thursday") : "";
    }
    {
      value.friday ? weekDays.push("Friday") : "";
    }
    {
      value.saturday ? weekDays.push("Saturday") : "";
    }
    {
      value.sunday ? weekDays.push("Sunday") : "";
    }

    const verifyDay = weekDays.includes(weekDay);
    // const verifyWorkHour =;
    const verifyWorkHour =
      value.startWorkHour <= horaAtual && value.endWorkHour >= horaAtual;
    const verifyWeekendWorkHour =
      value.startWorkHourWeekend <= horaAtual &&
      value.endWorkHourWeekend >= horaAtual;
    // Verifica se é a conexão padrão , se esta definido um expediente e se é o dia na semana definido para usar expediente
    if (value.isDefault === true && value.defineWorkHours) {
      if (verifyDay) {
        // verifica se é fim de semana e esta dentro do expediente definido
        if (
          (weekDay === "Saturday" || weekDay === "Sunday") &&
          verifyWeekendWorkHour
        ) {
          // se for dia de semana e esta dentro do expediente definido
          // console.log("dentro do fim de semana e expediente definidos")
          resulta = "true";
        } else if (
          weekDay !== "Saturday" &&
          weekDay !== "Sunday" &&
          verifyWorkHour
        ) {
          // console.log("dentro do dia da semana e expediente definidos");
          resulta = "true";
        } else {
          // console.log("fora do expediente da semana e do fim de semana");
          resulta = "false";
        }
      } else {
        // console.log("Dia sem expediente 1");
        resulta = "false";
      }
    } else {
      // Não definiu expediente, deixa o sistema 24h funcionando completo com direcionamentos a atendentes
      // console.log("Horario Expediente Desativado");
      resulta = "true";
    }
  });
  if (resulta === "true") {
    return true;
  }
  return false;
};

export default hourExpedient;
