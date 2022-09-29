import { Badge } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import { AddCircleOutline, ChatBubbleOutlineOutlined, LibraryBooks } from "@material-ui/icons";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import EventIcon from "@material-ui/icons/Event";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Can } from "../components/Can";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { i18n } from "../translate/i18n";


function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <div onClick={drawerClose}>
      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon />}
      />
      <ListItemLink
        to="/connections"
        primary={i18n.t("mainDrawer.listItems.connections")}
        icon={
          <Badge
            overlap="rectangular"
            badgeContent={connectionWarning ? "!" : 0}
            color="error"
          >
            <SyncAltIcon />
          </Badge>
        }
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
      />
      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlinedIcon />}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon />}
            />
            <ListItemLink
              to="/schedules"
              primary={i18n.t("mainDrawer.listItems.schedules")}
              icon={<EventIcon />}
            />
            <ListItemLink
              to="/tags"
              primary={i18n.t("mainDrawer.listItems.tags")}
              icon={<LocalOfferIcon />}
            />

<ListItemLink
              to="/BulkMessage"
              primary="Bulk Message"
              icon={<ChatBubbleOutlineOutlined />}
            />

            <ListItemLink
              to="/SettingsMessage"
              primary="Configurações Envio"
              icon={<AddCircleOutline />}
            />

            <ListItemLink
              to="/ShippingReport"
              primary="Relatório Envio"
              icon={<LibraryBooks />}
            />
            
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
