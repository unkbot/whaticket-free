import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import LinearBuffer from "../../components/LinearBuffer";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import PreviewMessage from "../../components/PreviewMessage";
import SelectConection from "../../components/SelectConection";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";






const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ContactSchema = Yup.object().shape({
  csv: Yup.string().required("Required"),
  model: Yup.string().required("Required"),
});

export const RenderForm = ({
  classes,
  contact,
  handleSaveContact,
  selectedQueueIds,
  setSelectedQueueIds,
  progressMessage,
  handlePreview,
}) => {
  return (
    <div className={classes.root}>
      <Formik
        initialValues={contact}
        enableReinitialize={true}
        validationSchema={ContactSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            handleSaveContact(values, actions);
          }, 400);
        }}
      >
        {({ values, errors, touched, isSubmitting, onChange }) => (
          <Form>
            <div>
              <SelectConection
                selectedQueueIds={selectedQueueIds}
                onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
              />
              <Field
                as={TextField}
                label="Modelo"
                type="model"
                multiline
                minRows={10}
                fullWidth
                name="model"
                error={touched.model && Boolean(errors.model)}
                helperText={touched.model && errors.model}
                variant="outlined"
                margin="dense"
              />

              <Field
                as={TextField}
                label="Dados"
                type="csv"
                multiline
                minRows={5}
                fullWidth
                name="csv"
                error={touched.csv && Boolean(errors.csv)}
                helperText={touched.csv && errors.csv}
                variant="outlined"
                margin="dense"
              />

              {/* <DataTable className={classes.btnWrapper} /> */}

              <LinearBuffer progressMessage={progressMessage} />
            </div>
            <div>
              <Button
                variant="contained"
                color="secondary"
                disabled={isSubmitting}
                onClick={() => handlePreview(values)}
                className={classes.btnWrapper}
              >
                Mostrar preview
              </Button>

              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
                variant="contained"
                className={classes.btnWrapper}
              >
                Enviar Mensagem
                {isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const Contacts = () => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const [selectedQueueIds, setSelectedQueueIds] = useState();
  const [progressMessage, setProgressMessage] = useState(0);
  const [startSendMessage, ] = useState(false);
  const [message, setMessage] = useState([]);
  const initialState = {
    csv: "",
    model: "",
  };

  const [contact, setContact] = useState(initialState);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    setContact(initialState);
    setProgressMessage(0);
  };

  const formatNumber = (number) => {
    if(!number) toastError("Número inválido");
    if (number.length > 11 && number.startsWith("55")) {
      return `${number}`;
    }else {
      return `55${number}`;
    }
  };

  const handleSaveContact = async (values, actions) => {
    try {

      if(!values.csv || !values.model) {
        toast.error("Preencha todos os campos");
        actions.setSubmitting(false);
        return;
      }

      if(!selectedQueueIds) {
        toast.error("Selecione uma conexão");
        actions.setSubmitting(false);
        return;
      }

      let { csv, model } = values;
      const csvHeader = csv.slice(0, csv.indexOf("\n")).split(",");
      const csvRows = csv.slice(csv.indexOf("\n") + 1).split("\n");

      const array = csvRows.map((i) => {
        const values = i.split(",");
        const obj = csvHeader.reduce((object, header, index) => {
          object[header] = values[index];
          return object;
        }, {});
        return obj;
      });

      let rawMsg = [];
      let listMessage = [];

      array.forEach((value, index) => {
        rawMsg.push(model.replace(/\{([^}]+)\}/g, (match, key) => value[key]));
      });

      array.forEach(async (value, index) => {
        const getValueObject = Object.values(value);
        listMessage.push({
          message: rawMsg[index],
          phone: formatNumber(getValueObject[0]),
          whatsappId: selectedQueueIds,
        });
      });
      try {
       console.log(listMessage)

       await api.post("/bulkMessage", listMessage);
        handleClose();
        actions.setSubmitting(false);
  
        toast.success(`${listMessage.length} Mensagem salva no banco de dados com sucesso`);
      } catch (error) {
        toastError(error);
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handlePreview = async (values) => {
    try {
      let { csv, model } = values;
      const csvHeader = csv.slice(0, csv.indexOf("\n")).split(",");
      const csvRows = csv.slice(csv.indexOf("\n") + 1).split("\n");

      const array = csvRows.map((i) => {
        const values = i.split(",");
        const obj = csvHeader.reduce((object, header, index) => {
          object[header] = values[index];
          return object;
        }, {});
        return obj;
      });

      let rawMsg = [];
      let listMessage = [];

      array.forEach((value, index) => {
        rawMsg.push(model.replace(/\{([^}]+)\}/g, (match, key) => value[key]));
      });


      array.forEach(async (value, index) => {
        const getValueObject = Object.values(value);
        listMessage.push({
          message: rawMsg[index],
          phone: formatNumber(getValueObject[0]),
          whatsappId: selectedQueueIds,
        });
      });

      setMessage(listMessage);
    } catch (err) {
      toastError(err);
    }
  };

  // const sendBulkMessage = async (message) => {
  //   let completedCount = 0;

  //   for (const iterator of message) {
  //     try {
  //       setStartSendMessage(true);
  //       await api.post("/bulkMessage/send", iterator);
  //       completedCount++;
  //       setProgressMessage((completedCount / message.length) * 100);
  //       await wait(5000);
  //     } catch (err) {
  //       toastError(err);
  //     }
  //   }
  // };

  // const wait = (milliseconds) => {
  //   return new Promise((resolve) => setTimeout(resolve, milliseconds));
  // };

  return (
    <MainContainer className={classes.mainContainer}>
      <MainHeader>
        <Title>Envio de Mensagem</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <RenderForm
          classes={classes}
          contact={contact}
          setContact={setContact}
          selectedQueueIds={selectedQueueIds}
          setSelectedQueueIds={setSelectedQueueIds}
          progressMessage={progressMessage}
          setProgressMessage={setProgressMessage}
          startSendMessage={startSendMessage}
          handleSaveContact={handleSaveContact}
          handlePreview={handlePreview}
        />

        <div>
          {message.length > 0 && (
            <PreviewMessage
              message={message}
             
            />
          )}
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Contacts;
