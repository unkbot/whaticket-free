import React from "react";
import * as Yup from "yup";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import api from "../../services/api";
import Typography from "@material-ui/core/Typography";
import EditIcon from "@material-ui/icons/Edit";
import { IconButton } from "@material-ui/core";
import { Formik, Field, FieldArray } from "formik";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import SaveIcon from "@material-ui/icons/Save";
import TextField from "@material-ui/core/TextField";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import CustomToolTip from "../ToolTips";
import ConfirmationModal from "../ConfirmationModal";
import { i18n } from "../../translate/i18n";
import Switch from "@material-ui/core/Switch";
import { FormControlLabel } from "@material-ui/core";

const QueueSchema = Yup.object().shape({
  options: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().min(4, "too short").required("Required"),
      })
    )
    .required("Must have friends"),
});

const useStyles = makeStyles((theme) => ({
  greetingMessage: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  Box: {
    cursor: "pointer",
    alignItems: "center",
  },
}));

function getStepContent(step) {
  return <VerticalLinearStepper chatBotId={step} />;
}

export default function VerticalLinearStepper(props) {
  const initialState = {
    name: "",
    greetingMessage: "",
    options: [],
  };

  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(-1);
  const [steps, setSteps] = React.useState(initialState);
  const [loading, setLoading] = React.useState(false);
  const [isStepContent, setIsStepContent] = React.useState(true);
  const [isNameEdit, setIsNamedEdit] = React.useState(null);
  const [isGreetingMessageEdit, setGreetingMessageEdit] = React.useState(null);
  const [selectedQueue, setSelectedQueue] = React.useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);

  const handleSaveBot = async (values) => {
    try {
      if (props.chatBotId) {
        await api.put(`/chatbot/${props.chatBotId}`, values);
      } else {
        await api.post("/chatbot", values);
      }
      toast.success("Bot saved successfully");
      // setActiveStep(-1)
      const { data } = await api.get(`/chatbot/${props.chatBotId}`);

      setSteps(initialState);
      setSteps(data);
      setIsNamedEdit(null);
      setGreetingMessageEdit(null);

      setSteps(data);
    } catch (err) {
      toastError(err);
    }
  };

  React.useEffect(() => {
    setLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchList = async () => {
        try {
          const { data } = await api.get(`/chatbot/${props.chatBotId}`);
          setSteps(data);
          setLoading(false);
        } catch (err) {
          console.log(err);
        }
      };
      fetchList();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [props.chatBotId]);

  React.useEffect(() => {
    if (activeStep === isNameEdit) {
      setIsStepContent(false);
    } else {
      setIsStepContent(true);
    }
  }, [isNameEdit, activeStep]);

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/chatbot/${queueId}`);
      const { data } = await api.get(`/chatbot/${props.chatBotId}`);
      setSteps(initialState);
      setSteps(data);
      setIsNamedEdit(null);
      setGreetingMessageEdit(null);
      setSteps(data);
      toast.success(i18n.t("Queue deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${
            selectedQueue.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("Tem certeza? Todas as opções internas também serão excluídas")}
      </ConfirmationModal>

      {!loading && (
        <div>
          <Formik
            initialValues={steps}
            validateOnChange={false}
            enableReinitialize={true}
            validationSchema={QueueSchema}
            render={({
              touched,
              errors,
              isSubmitting,
              values,
              handleSubmit,
            }) => (
              <FieldArray name="options">
                {({ push, remove }) => (
                  <>
                    <Stepper
                      nonLinear
                      activeStep={activeStep}
                      orientation="vertical"
                    >
                      {values.options &&
                        values.options.length > 0 &&
                        values.options.map((info, index) => (
                          <Step
                            key={`${info.id ? info.id : index}-options`}
                            onClick={() => setActiveStep(index)}
                          >
                            <StepLabel key={`${info.id}-options`}>
                              {isNameEdit !== index &&
                              steps.options[index]?.name ? (
                                <div
                                  className={classes.greetingMessage}
                                  variant="body1"
                                >
                                  {values.options[index].name}

                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setIsNamedEdit(index);
                                      setIsStepContent(false);
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>

                                  <IconButton
                                    onClick={() => {
                                      setSelectedQueue(info);
                                      setConfirmModalOpen(true);
                                    }}
                                    size="small"
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </div>
                              ) : (
                                <>
                                  <Field
                                    as={TextField}
                                    name={`options[${index}].name`}
                                    variant="standard"
                                    color="primary"
                                    disabled={isSubmitting}
                                    autoFocus
                                    error={
                                      touched?.options?.[index]?.name &&
                                      Boolean(errors.options?.[index]?.name)
                                    }
                                    className={classes.textField}
                                  />

                                  <FormControlLabel
                                    control={
                                      <Field
                                        as={Switch}
                                        color="primary"
                                        name={`options[${index}].isAgent`}
                                        checked={
                                          values.options[index].isAgent || false
                                        }
                                      />
                                    }
                                    label="Atendente"
                                  />

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      values.options[index].name
                                        ? handleSaveBot(values)
                                        : null
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <SaveIcon />
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() => remove(index)}
                                    disabled={isSubmitting}
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </>
                              )}
                            </StepLabel>

                            {isStepContent && steps.options[index] && (
                              <StepContent>
                                <>
                                  {isGreetingMessageEdit !== index ? (
                                    <div className={classes.greetingMessage}>
                                      <Typography
                                        color="textSecondary"
                                        variant="body1"
                                      >
                                        Message:
                                      </Typography>

                                      {values.options[index].greetingMessage}

                                      {!steps.options[index]
                                        ?.greetingMessage && (
                                        <CustomToolTip
                                          title="A mensagem é obrigatória para seguir ao próximo nível"
                                          content="Se a mensagem não estiver definida, o bot não seguirá adiante"
                                        >
                                          <HelpOutlineOutlinedIcon
                                            color="secondary"
                                            style={{ marginLeft: "4px" }}
                                            fontSize="small"
                                          />
                                        </CustomToolTip>
                                      )}

                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          setGreetingMessageEdit(index)
                                        }
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </div>
                                  ) : (
                                    <div className={classes.greetingMessage}>
                                      <Field
                                        as={TextField}
                                        name={`options[${index}].greetingMessage`}
                                        variant="standard"
                                        margin="dense"
                                        fullWidth
                                        multiline
                                        error={
                                          touched.greetingMessage &&
                                          Boolean(errors.greetingMessage)
                                        }
                                        helperText={
                                          touched.greetingMessage &&
                                          errors.greetingMessage
                                        }
                                        className={classes.textField}
                                      />

                                      <IconButton
                                        size="small"
                                        onClick={() => handleSaveBot(values)}
                                        disabled={isSubmitting}
                                      >
                                        {" "}
                                        <SaveIcon />
                                      </IconButton>
                                    </div>
                                  )}

                                  {getStepContent(info.id)}
                                </>
                              </StepContent>
                            )}
                          </Step>
                        ))}

                      <Step>
                        <StepLabel
                          onClick={() =>
                            push({
                              name: undefined,
                              greetingMessage: undefined,
                            })
                          }
                        >
                          Adiconar opções
                        </StepLabel>
                      </Step>
                    </Stepper>
                  </>
                )}
              </FieldArray>
            )}
          />
        </div>
      )}
    </div>
  );
}
