import { useEffect, useState } from "react";
import {
	ComponentProps,
	Streamlit,
	withStreamlitConnection,
} from "streamlit-component-lib";
import { Table, TextInput, MantineProvider, Button } from "@mantine/core";
import { CSVLink } from "react-csv";

interface Data {
	Field: string;
	Min: number;
	Max: number;
	Group: string;
	Description: string;
	Unit: string;
	LLL: number;
	LL: number;
	L: number;
	H: number;
	HH: number;
	HHH: number;
	Flag: number;
	Evaluation: string;
}

declare type CustomComponentProps = Partial<ComponentProps>;

const CustomDataFrame = (props: CustomComponentProps) => {
	let data: Data[] = [];
	let header = "";
	if (Object.keys(props).length > 0) {
		data = props?.args?.data;
		header = props?.args?.header;
	}

	useEffect(() => Streamlit.setFrameHeight());
	const [comment, setComment] = useState("");

	const rows = data.map((item, index) => (
		<tr key={index}>
			{Object.values(item).map((value, _index) => (
				<td key={_index}>{value}</td>
			))}
		</tr>
	));

	return (
		<MantineProvider
			theme={{
				colorScheme: "light",
				colors: {
					light: ["E53E3E", "FFFFFF"],
				},
			}}>
			<div style={{ display: "flex" }}>
				<h2 style={{ alignSelf: "left", width: "100%" }}>{header}</h2>
				<CSVLink
					style={{ alignSelf: "right" }}
					data={`Comment:,${comment}\n${Object.keys(data[0]).join(",")}\n${data
						.map((item) => Object.values(item).join(","))
						.join("\n")}`}
					target="_blank"
					filename={header}>
					<Button variant="outline">Download</Button>
				</CSVLink>
			</div>
			<Table highlightOnHover withBorder withColumnBorders>
				<thead>
					<tr>
						<th colSpan={Object.keys(data[0]).length}>
							<TextInput
								placeholder="Comment?"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							/>
						</th>
					</tr>
					<tr>
						{Object.keys(data[0]).map((key, index) => (
							<th key={index}>{key}</th>
						))}
					</tr>
				</thead>
				<tbody>{rows}</tbody>
			</Table>
		</MantineProvider>
	);
};

export default withStreamlitConnection(CustomDataFrame);
