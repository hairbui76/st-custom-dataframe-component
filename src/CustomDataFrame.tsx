import {
	Button,
	Center,
	Group,
	MantineProvider,
	Table,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronUp,
	IconSearch,
	IconSelector,
} from "@tabler/icons";
import React, { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import {
	ComponentProps,
	Streamlit,
	withStreamlitConnection,
} from "streamlit-component-lib";
import "./CustomDataFrame.css";

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

interface ThProps {
	children: React.ReactNode;
	icon: React.ReactNode;
	index: number;
	handleSortData(key: keyof Data, index: number): void;
}

const severityColors = ["White", "Pink", "Red", "Crimson"];
const Th = function ({ children, icon, index, handleSortData }: ThProps) {
	return (
		<th
			key={index}
			style={
				children === "Min" || children === "Max" || children === "Flag"
					? { minWidth: "70px" }
					: {}
			}>
			<UnstyledButton
				onClick={() => handleSortData(children as keyof Data, index)}
				style={{ width: "100%" }}>
				<Group>
					<Text weight={500} size="sm">
						{children}
					</Text>
					{children === "Min" || children === "Max" || children === "Flag" ? (
						<Center>{icon}</Center>
					) : (
						""
					)}
				</Group>
			</UnstyledButton>
		</th>
	);
};

interface HeaderObj {
	alert_type: string;
	start: string;
	end: string;
}
const CustomDataFrame = (props: CustomComponentProps) => {
	const data: Data[] = useRef(props?.args?.data ? props.args.data : []).current;
	const [search, setSearch] = useState("");
	const [searchData, setSearchData] = useState<Data[]>(data);
	let header = props?.args?.header ? props.args.header : "";
	try {
		header = JSON.parse(header);
	} catch (e) {
		console.error("Header is string!");
	}
	const withSearch = props?.args?.withSearch;
	const withComment = props?.args?.withComment;
	const withDownload = props?.args?.withDownload;
	const headerLists = useRef(
		Object.keys(data.length > 0 ? data[0] : [])
	).current;
	const [icons, setIcon] = useState<(boolean | undefined)[]>(
		props?.args?.data ? new Array(props.args.data.length).fill(undefined) : []
	);

	useEffect(() => Streamlit.setFrameHeight());
	useEffect(() => {
		setSearchData(() => {
			let arr: Data[] = structuredClone(data);
			return arr.filter((item: Data) =>
				(Object.keys(arr[0]) as (keyof Data)[]).some((key) => {
					if (typeof item[key] === "string") {
						return (item[key] as string)
							.toLowerCase()
							.includes(search.toLowerCase());
					}
					return item[key] === parseFloat(search);
				})
			);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);
	const [comment, setComment] = useState("");

	const handleSortData = (sortKey: keyof Data, index: number) => {
		setSearchData((prev) => {
			let arr = structuredClone(prev);
			if (icons[index] === true)
				arr.sort((a, b) => {
					if (a[sortKey] < b[sortKey]) return -1;
					if (a[sortKey] > b[sortKey]) return 1;
					return 0;
				});
			else
				arr.sort((a, b) => {
					if (a[sortKey] > b[sortKey]) return -1;
					if (a[sortKey] < b[sortKey]) return 1;
					return 0;
				});
			return arr;
		});
		setIcon((prev) => [
			...prev.slice(0, index).fill(undefined),
			prev[index] === undefined ? true : prev[index] ? false : true,
			...prev.slice(index + 1).fill(undefined),
		]);
	};

	const renderHeaderString = (header: string): React.ReactNode =>
		header && header.length ? (
			<h2 style={{ alignSelf: "left", width: "100%" }}>{header}</h2>
		) : (
			""
		);

	const handleEvaluationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	): void => {
		setSearchData((prev) => {
			let arr = structuredClone(prev);
			arr[index].Evaluation = e.target.value;
			return arr;
		});
	};

	const renderHeaderObj = (header: HeaderObj): React.ReactNode => {
		if (!header) {
			return "";
		}
		console.log(header);
		return (
			<div style={{ display: "flex" }}>
				<span
					className={
						"alert-type " +
						(header.alert_type === "START" ? "alert-start" : "alert-stop")
					}>
					{header.alert_type}
				</span>
				<div className="alert-time start-time">
					<div>{header.start}</div>
				</div>
				<div className="alert-time stop-time">
					<div>{header.end}</div>
				</div>
			</div>
		);
	};

	const rows = searchData.map((item, index) => (
		<tr key={index} className={severityColors[+item.Flag]}>
			{Object.entries(item).map(([key, value], _index) => {
				if (key === "Evaluation")
					return (
						<td key={_index}>
							<TextInput
								value={value}
								onChange={(e) => handleEvaluationChange(e, index)}
							/>
						</td>
					);
				return (
					<td key={_index}>
						{_index === 1 || _index === 2 ? value.toFixed(4) : value}
					</td>
				);
			})}
		</tr>
	));

	return (
		<MantineProvider
			theme={{
				colorScheme: "light",
				colors: {
					light: ["E53E3E", "FFFFFF"],
				},
				fontSizes: "12px",
			}}>
			<div style={{ display: "flex", marginBottom: "10px" }}>
				{typeof header === "string"
					? renderHeaderString(header)
					: renderHeaderObj(header)}

				{withDownload ? (
					<CSVLink
						style={{ alignSelf: "right" }}
						data={`Comment:,${comment}\n${headerLists.join(",")}\n${searchData
							.map((item) => Object.values(item).join(","))
							.join("\n")}`}
						target="_blank"
						filename={header}>
						<Button variant="outline">Download CSV</Button>
					</CSVLink>
				) : (
					""
				)}
			</div>
			{withSearch ? (
				<TextInput
					placeholder="Search by any field"
					mb="md"
					icon={<IconSearch size={14} stroke={1.5} />}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			) : (
				""
			)}
			<div className="table-container">
				<Table style={{ borderSpacing: "0px", borderCollapse: "separate" }}>
					<thead style={{ position: "sticky", top: "0px" }}>
						{withComment ? (
							<tr>
								<th colSpan={headerLists.length} style={{ border: "none" }}>
									<TextInput
										placeholder="Comment?"
										value={comment}
										onChange={(e) => setComment(e.target.value)}
									/>
								</th>
							</tr>
						) : (
							""
						)}
						<tr
							style={{
								background: "#efefef",
								boxShadow: "0px 1px 1px 0px #cec7c7",
							}}>
							{headerLists.map((key, index) => (
								<Th
									index={index}
									icon={
										icons[index] === undefined ? (
											<IconSelector />
										) : icons[index] ? (
											<IconChevronUp />
										) : (
											<IconChevronDown />
										)
									}
									handleSortData={handleSortData}>
									{key}
								</Th>
							))}
						</tr>
					</thead>
					<tbody style={{ fontSize: "12px" }}>{rows}</tbody>
				</Table>
			</div>
		</MantineProvider>
	);
};

export default withStreamlitConnection(CustomDataFrame);
