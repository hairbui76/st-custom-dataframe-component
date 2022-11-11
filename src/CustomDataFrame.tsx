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
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import {
	ComponentProps,
	Streamlit,
	withStreamlitConnection,
} from "streamlit-component-lib";

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

const Th = function ({ children, icon, index, handleSortData }: ThProps) {
	return (
		<th key={index}>
			<UnstyledButton
				onClick={() => handleSortData(children as keyof Data, index)}
				style={{ width: "100%" }}>
				<Group position="apart">
					<Text weight={900} size="sm">
						{children}
					</Text>
					<Center>{icon}</Center>
				</Group>
			</UnstyledButton>
		</th>
	);
};

const CustomDataFrame = (props: CustomComponentProps) => {
	const data: Data[] = useRef(props?.args?.data ? props.args.data : []).current;
	const [search, setSearch] = useState("");
	const [searchData, setSearchData] = useState<Data[]>(data);
	const header = props?.args?.header ? props.args.header : "";
	const headerLists = useRef(
		Object.keys(data.length > 0 ? data[0] : [])
	).current;
	const [icons, setIcon] = useState<(boolean | undefined)[]>(
		props?.args?.data ? new Array(props.args.data.length).fill(undefined) : []
	);

	useEffect(() => Streamlit.setFrameHeight());
	useEffect(() => {
		setSearchData(() => {
			let arr = structuredClone(data);
			return arr.filter((item) =>
				Object.keys(arr[0]).some((key) => {
					// @ts-ignore
					if (typeof item[key] === "string") {
						// @ts-ignore
						return item[key].toLowerCase().includes(search.toLowerCase());
					}
					return false;
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
				// @ts-ignore
				arr.sort((a, b) => b[sortKey] - a[sortKey]);
			// @ts-ignore
			else arr.sort((a, b) => a[sortKey] - b[sortKey]);
			return arr;
		});
		setIcon((prev) => [
			...prev.slice(0, index).fill(undefined),
			prev[index] === undefined ? true : prev[index] ? false : true,
			...prev.slice(index + 1).fill(undefined),
		]);
	};

	const rows = searchData.map((item, index) => (
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
			<div style={{ display: "flex", marginBottom: "10px" }}>
				<h2 style={{ alignSelf: "left", width: "100%" }}>{header}</h2>
				<CSVLink
					style={{ alignSelf: "right" }}
					data={`Comment:,${comment}\n${headerLists.join(",")}\n${searchData
						.map((item) => Object.values(item).join(","))
						.join("\n")}`}
					target="_blank"
					filename={header}>
					<Button variant="outline">Download CSV</Button>
				</CSVLink>
			</div>
			<TextInput
				placeholder="Search by any field"
				mb="md"
				icon={<IconSearch size={14} stroke={1.5} />}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<div className="table-container">
				<Table>
					<thead>
						<tr>
							<th colSpan={headerLists.length}>
								<TextInput
									placeholder="Comment?"
									value={comment}
									onChange={(e) => setComment(e.target.value)}
								/>
							</th>
						</tr>
						<tr>
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
					<tbody>{rows}</tbody>
				</Table>
			</div>
		</MantineProvider>
	);
};

export default withStreamlitConnection(CustomDataFrame);
