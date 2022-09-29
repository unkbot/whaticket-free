import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";

import clsx from "clsx";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import SelectConection from "../../components/SelectConection";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  margin: {
    marginTop: theme.spacing(2),
    // marginBottom: theme.spacing(2),
    // marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(1),
  },
  textField: {
    width: "25ch",
  },
}));

const ConfigMessage = () => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);

  const [values, setValues] = React.useState({});

  const [state, setState] = React.useState({
    contact: false,
    photo: false,
    random: false,
  });



  useEffect(() => {
    console.log('mudou', selectedQueueIds)

    setValues({
      limit: "",
      minutes: "",
      seconds: "",

    });

    if(!selectedQueueIds) return
    api.get(`/settingsMessage/${selectedQueueIds}`).then((response) => {
      console.log('response', response.data)
      setValues({
        limit: response.data.limit,
        minutes: response.data.minutes,
        seconds: response.data.seconds,
      });
      setState({
        contact: response.data.contacts,
        photo: response.data.photo,
        random: response.data.random,
      });

    }
    ).catch((error) => {
      toastError(error);
    }
    );



  }, [selectedQueueIds])

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleChangeChecked = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const handleSaveSettings = async() => {
    const data = {
      ...values,
      ...state,
      whatsappId: selectedQueueIds,
    }


    try {
      await api.post(`/settingsMessage`, data);
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }

    console.log(data);
  }

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <MainContainer className={classes.mainContainer}>
      <MainHeader>
        <Title>Configuração de envio de mensagem.</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <SelectConection
          selectedQueueIds={selectedQueueIds}
          onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
        />

        <div>
          <TextField
            label="Limite de envio a cada 24h"
            id="limit"
            onChange={handleChange("limit")}
            className={clsx(classes.margin, classes.textField)}
            value={values.limit}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">Limite</InputAdornment>
              ),
            }}
          />

          <TextField
            label="Aguardar entre"
            id="minutes"
            value={values.minutes}
            onChange={handleChange("minutes")}
            className={clsx(classes.margin, classes.textField)}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">Minutos</InputAdornment>
              ),
            }}
          />

          <TextField
            label="Segundos a cada envio"
            id="seconds"
            value={values.seconds}
            onChange={handleChange("seconds")}
            className={clsx(classes.margin, classes.textField)}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">Segundos</InputAdornment>
              ),
            }}
          />
        </div>
        <div>
          <FormControl
            component="fieldset"
            fullWidth
            className={classes.margin}
          >
            <FormLabel component="legend">Configurações adicionais</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.contact}
                    onChange={handleChangeChecked}
                    name="contact"
                  />
                }
                label="Enviar só para os meus contatos"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.photo}
                    onChange={handleChangeChecked}
                    name="photo"
                  />
                }
                label="Enviar mensagem só para os numeros que tem foto"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.random}
                    onChange={handleChangeChecked}
                    name="random"
                  />
                }
                label="Enviar em orderm aleatoria  "
              />
            </FormGroup>
          </FormControl>

          <FormControl fullWidth className={classes.margin}>
            <InputLabel htmlFor="standard-adornment-amount">
              Incluir mensagem no final com opção de não receber mais (opt-out)
            </InputLabel>
            <Input
              id="standard-adornment-amount"
              onChange={handleChange("optOut")}
              multiline
              rows={5}
              margin="dense"
              variant="outlined"
            />
          </FormControl>
        </div>

        <div>
          <Button
            variant="contained"
            color="primary"
            className={classes.margin}
            onClick={() => {
       
              handleSaveSettings();
            }}
          >
            Salvar configurações
          </Button>
        </div>
      </Paper>
    </MainContainer>
  );
};

export default ConfigMessage;
