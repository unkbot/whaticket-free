import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import {
	Tooltip,
	Typography,
	CircularProgress,
} from "@material-ui/core";

import {
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
} from "@material-ui/icons";

import { green } from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const QueueSelect = ({ selectedQueueIds, onChange }) => {
	const classes = useStyles();
	const [queues, setQueues] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/whatsapp");
				const conectionNotDefault = data.filter(
					conection => conection.isDefault !== true
				);
				setQueues(conectionNotDefault);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	const handleChange = e => {
		onChange(e.target.value);
	};

	const renderStatusToolTips = whatsApp => {
		return (
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} className={classes.buttonProgress} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar style={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</div>
		);
	};

	const renderSelect = whatsApp => {
		const queue = queues.find(q => q.id === whatsApp);
		
		return queue ? (
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				{queue.name}
				{renderStatusToolTips(queue)}
			</div>
		) : null;
	}

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>Selecione uma conexão*</InputLabel>
				<Select
					// multiple
					labelWidth={180}
					value={selectedQueueIds}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
					renderValue={selected => renderSelect(selected)}
				>
					{queues.map(queue => (
						<MenuItem key={queue.id} value={queue.id} style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between'
						}}>
							{queue.name}
							{renderStatusToolTips(queue)}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default QueueSelect;