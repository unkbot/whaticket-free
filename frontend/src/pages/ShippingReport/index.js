import React, { useState, useEffect, useReducer } from "react";
import openSocket from "../../services/socket-io";

import {
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  TextField,
  Button
} from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICK_ANSWERS") {
    const quickAnswers = action.payload;
    const newQuickAnswers = [];

    quickAnswers.forEach((quickAnswer) => {
      const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswer.id);
      if (quickAnswerIndex !== -1) {
        state[quickAnswerIndex] = quickAnswer;
      } else {
        newQuickAnswers.push(quickAnswer);
      }
    });

    return [...state, ...newQuickAnswers];
  }

  if (action.type === "UPDATE_QUICK_ANSWERS") {
    const quickAnswer = action.payload;
    const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswer.id);

    if (quickAnswerIndex !== -1) {
      state[quickAnswerIndex] = quickAnswer;
      return [...state];
    } else {
      return [quickAnswer, ...state];
    }
  }

  if (action.type === "DELETE_MASS_MESSAGE") {
    const massMessageId = action.payload;
    console.log(massMessageId);
    const quickAnswerIndex = state.findIndex((q) => q.id === massMessageId);
    if (quickAnswerIndex !== -1) {
      state.splice(quickAnswerIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const QuickAnswers = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [quickAnswers, dispatch] = useReducer(reducer, []);
  const [deletingQuickAnswers, setDeletingQuickAnswers] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchQuickAnswers = async () => {
        try {
          const { data } = await api.get("/bulkMessage/report", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_QUICK_ANSWERS", payload: data.messages });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchQuickAnswers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("massMessage", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({
          type: "UPDATE_QUICK_ANSWERS",
          payload: data.scheduleRecord,
        });
      }

      if (data.action === "delete") {
        console.log("delete");
        dispatch({
          type: "DELETE_MASS_MESSAGE",
          payload: +data.scheduleRecord,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleDeleteQuickAnswers = async (massMessageId) => {
    try {
      await api.delete(`/bulkMessage/d/${massMessageId}`);
      toast.success(i18n.t("quickAnswers.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickAnswers(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleDeleteAll = async () => {
    try {
      await api.delete(`/bulkMessage/clean`);
      toast.success(i18n.t("quickAnswers.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    quickAnswers(reducer, []);
    setDeletingQuickAnswers(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingQuickAnswers &&
          `Você tem certeza que quer excluir este relatório: ${deletingQuickAnswers.phone}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickAnswers(deletingQuickAnswers.id)}
      >
        {i18n.t("quickAnswers.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <Title>Relatório de envio de mensagens</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("quickAnswers.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleDeleteAll}
          >
            Limpar base 
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Conexão</TableCell>
              <TableCell align="center">Numero</TableCell>
              <TableCell align="center">Mensagem</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">
                {i18n.t("quickAnswers.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {quickAnswers.map((quickAnswer) => (
                <TableRow key={quickAnswer.id}>
                  <TableCell align="center">
                    {quickAnswer?.whatsapp?.name} /{" "}
                    {quickAnswer?.whatsapp?.number}
                  </TableCell>
                  <TableCell align="center">{quickAnswer.phone}</TableCell>
                  <TableCell align="center">{quickAnswer.message}</TableCell>
                  <TableCell align="center">{quickAnswer.status}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingQuickAnswers(quickAnswer);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default QuickAnswers;
