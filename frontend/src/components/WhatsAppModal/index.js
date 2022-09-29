import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  FormGroup,
  Tooltip,
  Paper,
  Grid,
  Checkbox,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const longText = `
Desmarque esta opção para definir um horário de expediente para os atendimentos.
Quando um usuário escolher ser direcionado a um atendente, o sistema irá
verificar o horário e o dia, se estiver fora do expediente, envia um aviso
ao usuário e não direciona ao atendente escolhido.
`;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  expediente: {
    display: "flex",
    flexWrap: "wrap",
  },
  tituloReceberMsg: {
    fontSize: 12,
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  reabrirTicket: {
    fontSize: 12,
    display: "flex",
    marginLeft: theme.spacing(2),
  },
  textSize: {
    fontSize: 12,
  },
  paperReceberMsg: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  diasSemana: {
    marginLeft: theme.spacing(1),
  },
  hora: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: 250,
  },
  textoExpediente: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(3),
    width: "100%",
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    greetingMessage: "",
    farewellMessage: "",
    isDefault: false,
    isMultidevice: true,
    transferTicketMessage: "",
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [defineWorkHours, SetDefineWorkHours] = useState(false);
  const [outOfWorkMessage, setOutOfWorkMessage] = useState("");
  const [startWorkHour, setStartWorkHour] = useState("08:00");
  const [endWorkHour, setEndWorkHour] = useState("17:30");
  const [startWorkHourWeekend, setStartWorkHourWeekend] = useState("08:00");
  const [endWorkHourWeekend, setEndWorkHourWeekend] = useState("17:30");
  const [seg, setSeg] = useState(true);
  const [ter, setTer] = useState(true);
  const [quar, setQuar] = useState(true);
  const [quin, setQuin] = useState(true);
  const [sex, setSex] = useState(true);
  const [sab, setSab] = useState(false);
  const [dom, setDom] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}`);
        setWhatsApp(data);
        setSeg(data.monday);
        setTer(data.tuesday);
        setQuar(data.wednesday);
        setQuin(data.thursday);
        setSex(data.friday);
        setSab(data.saturday);
        setDom(data.sunday);
        SetDefineWorkHours(data.defineWorkHours);
        setOutOfWorkMessage(data.outOfWorkMessage);
        setStartWorkHour(data.startWorkHour);
        setEndWorkHour(data.endWorkHour);
        setStartWorkHourWeekend(data.startWorkHourWeekend);
        setEndWorkHourWeekend(data.endWorkHourWeekend);
        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(whatsQueueIds);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  const handleChange = (e) => {
    if (e.target.value === "MON") {
      setSeg(e.target.checked);
    }
    if (e.target.value === "TUE") {
      setTer(e.target.checked);
    }
    if (e.target.value === "WED") {
      setQuar(e.target.checked);
    }
    if (e.target.value === "THU") {
      setQuin(e.target.checked);
    }
    if (e.target.value === "FRI") {
      setSex(e.target.checked);
    }
    if (e.target.value === "SAT") {
      setSab(e.target.checked);
    }
    if (e.target.value === "SUN") {
      setDom(e.target.checked);
    }

    if (e.target.value === "defineWorkHours") {
      SetDefineWorkHours(e.target.checked);
    }
  };

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = {
      ...values,
      queueIds: selectedQueueIds,
      startWorkHour: startWorkHour,
      endWorkHour: endWorkHour,
      defineWorkHours: defineWorkHours,
      outOfWorkMessage: outOfWorkMessage,
      startWorkHourWeekend: startWorkHourWeekend,
      endWorkHourWeekend: endWorkHourWeekend,
      monday: seg,
      tuesday: ter,
      wednesday: quar,
      thursday: quin,
      friday: sex,
      saturday: sab,
      sunday: dom,
    };

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp", whatsappData);
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="isDefault"
                        checked={values.isDefault}
                      />
                    }
                    label={i18n.t("whatsappModal.form.default")}
                  />

              
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.greetingMessage")}
                    type="greetingMessage"
                    multiline
                    rows={5}
                    fullWidth
                    name="greetingMessage"
                    error={
                      touched.greetingMessage && Boolean(errors.greetingMessage)
                    }
                    helperText={
                      touched.greetingMessage && errors.greetingMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.farewellMessage")}
                    type="farewellMessage"
                    multiline
                    rows={5}
                    fullWidth
                    name="farewellMessage"
                    error={
                      touched.farewellMessage && Boolean(errors.farewellMessage)
                    }
                    helperText={
                      touched.farewellMessage && errors.farewellMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>

                <div>
                  <Field
                    as={TextField}
                    label="Mensagem de trasnferencia de atendimento"
                    type="transferTicketMessage"
                    multiline
                    rows={5}
                    fullWidth
                    name="transferTicketMessage"
                    error={
                      touched.transferTicketMessage &&
                      Boolean(errors.transferTicketMessage)
                    }
                    helperText={
                      touched.transferTicketMessage &&
                      errors.transferTicketMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>

                <div>
                  {/* Expediente */}

                  {defineWorkHours === true ? (
                    <div
                    // className={classes.textoExpediente}
                    >
                      <TextField
                        label={i18n.t("queueModal.form.outOfWorkMessage")}
                        rows={4}
                        multiline
                        fullWidth
                        name="outOfWorkMessage"
                        value={outOfWorkMessage}
                        error={
                          touched.outOfWorkMessage &&
                          Boolean(errors.outOfWorkMessage)
                        }
                        helperText={
                          touched.outOfWorkMessage && errors.outOfWorkMessage
                        }
                        variant="outlined"
                        margin="dense"
                        onChange={(e) => setOutOfWorkMessage(e.target.value)}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} className={classes.diasSemana}>
                      <FormControl component="fieldset">
                        <FormGroup
                          aria-label="position"
                          row
                          sx={{
                            width: {
                              xs: 100,
                              sm: 200,
                              md: 300,
                              lg: 600,
                              xl: 700,
                            },
                          }}
                        >
                          <Tooltip title={longText} placement="top">
                            <FormControlLabel
                              value="defineWorkHours"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={defineWorkHours}
                                  onChange={handleChange}
                                />
                              }
                              label="Definir horário de expediente"
                              labelPlacement="end"
                            />
                          </Tooltip>
                        </FormGroup>
                      </FormControl>
                    </Grid>
                    {defineWorkHours === true ? (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            className={classes.hora}
                            type="time"
                            label={i18n.t("queueModal.form.startWorkHour")}
                            name="startWorkHour"
                            value={startWorkHour}
                            onChange={(e) => setStartWorkHour(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            className={classes.hora}
                            type="time"
                            label={i18n.t("queueModal.form.endWorkHour")}
                            name="endWorkHour"
                            value={endWorkHour}
                            onChange={(e) => setEndWorkHour(e.target.value)}
                          />
                        </Grid>
                      </>
                    ) : (
                      ""
                    )}
                  </Grid>
                  {defineWorkHours === true ? (
                    <>
                      <Grid item xs={12} sm={12} className={classes.diasSemana}>
                        <FormControl component="fieldset">
                          <FormGroup
                            aria-label="position"
                            row
                            sx={{
                              width: {
                                xs: 100,
                                sm: 200,
                                md: 300,
                                lg: 600,
                                xl: 700,
                              },
                            }}
                          >
                            <FormControlLabel
                              value="MON"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={seg}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("queueModal.form.monday")}
                              labelPlacement="end"
                            />
                            <FormControlLabel
                              value="TUE"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={ter}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("queueModal.form.tuesday")}
                              labelPlacement="end"
                            />
                            <FormControlLabel
                              value="WED"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={quar}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("queueModal.form.wednesday")}
                              labelPlacement="end"
                            />
                            <FormControlLabel
                              value="THU"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={quin}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("queueModal.form.thursday")}
                              labelPlacement="end"
                            />
                            <FormControlLabel
                              value="FRI"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={sex}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("queueModal.form.friday")}
                              labelPlacement="end"
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                    </>
                  ) : (
                    ""
                  )}
                  {defineWorkHours === true ? (
                    <>
                      <Paper>
                        <Grid container spacing={2} style={{ marginTop: 10 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("queueModal.form.startWorkHour")}
                              name="StartWorkHourWeekend"
                              value={startWorkHourWeekend}
                              onChange={(e) =>
                                setStartWorkHourWeekend(e.target.value)
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("queueModal.form.endWorkHour")}
                              name="EndWorkHourWeekend"
                              value={endWorkHourWeekend}
                              onChange={(e) =>
                                setEndWorkHourWeekend(e.target.value)
                              }
                            />
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={12}
                          className={classes.diasSemana}
                        >
                          <FormControl component="fieldset">
                            <FormGroup
                              aria-label="position"
                              row
                              sx={{
                                width: {
                                  xs: 100,
                                  sm: 200,
                                  md: 300,
                                  lg: 600,
                                  xl: 700,
                                },
                              }}
                            >
                              <FormControlLabel
                                value="SAT"
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={sab}
                                    onChange={handleChange}
                                  />
                                }
                                label={i18n.t("queueModal.form.saturday")}
                                labelPlacement="end"
                              />
                              <FormControlLabel
                                value="SUN"
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={dom}
                                    onChange={handleChange}
                                  />
                                }
                                label={i18n.t("queueModal.form.sunday")}
                                labelPlacement="end"
                              />
                            </FormGroup>
                          </FormControl>
                        </Grid>
                      </Paper>
                    </>
                  ) : (
                    ""
                  )}
                </div>

                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);
