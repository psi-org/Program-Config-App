import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { OrganisationUnitTree } from "@dhis2/ui";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    DialogActions,
    DialogContent,
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    TextField,
    Tooltip
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from "react";
import { concatArraysUnique, parseErrorsJoin, parseErrorsUL, truncateString } from "../../utils/Utils.js";
import CustomMUIDialog from "../UIElements/CustomMUIDialog.js";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle.js";

const orgUnitsQuery = {
    userOrgUnits: {
        resource: "me",
        params: {
            fields: ["organisationUnits[id, path]"],
        },
    },
    orgUnitGroups: {
        resource: "organisationUnitGroups",
        params: {
            paging: false,
            fields: ["id", "displayName"],
            order: "displayName",
        },
    },
    orgUnitLevels: {
        resource: "organisationUnitLevels",
        params: {
            paging: false,
            fields: ["id", "level", "displayName"],
            order: "level",
        },
    },
};

const ouQuery = {
    results: {
        resource: "organisationUnits",
        params: ({ level }) => ({
            paging: false,
            fields: ["id", "path"],
            level: [level],
        }),
    },
};

const ouGroupQuery = {
    results: {
        resource: "organisationUnits",
        params: ({ groupId }) => ({
            paging: false,
            fields: ["id", "path"],
            includeDescendants: true,
            filter: ["organisationUnitGroups.id:eq:" + groupId],
        }),
    },
};

const searchOrgUnitQuery = {
    results: {
        resource: "organisationUnits",
        params: ({ filterString }) => ({
            pageSize: 100,
            fields: ["id", "path", "displayName"],
            filter: [`identifiable:token:${filterString}`],
            withinUserHierarchy: true,
        }),
    },
};

const metadataMutation = {
    resource: "metadata",
    type: "create",
    data: ({ data }) => data,
};

const programOrgUnitsQuery = {
    results: {
        resource: "programs",
        id: ({ id }) => id,
        params: {
            fields: ["organisationUnits[id]", "organisationUnits[path]"],
        },
    },
};

const OunitScreen = ({ id, readOnly, setOrgUnitProgram, setNotification }) => {
    const programMetadata = {
        results: {
            resource: "programs/" + id + "/metadata.json",
        },
    };
    let level, filterString, groupId;
    const filterRef = useRef(null);
    const [orgUnitLevel, setOrgUnitLevel] = useState(undefined);
    const [orgUnitGroup, setOrgUnitGroup] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [content, setContent] = useState("form");
    const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
    const [orgUnitPathSelected, setOrgUnitPathSelected] = useState([]);
    const [orgUnitTreeRoot, setOrgUnitTreeRoot] = useState([]);
    const [orgUnitFiltered, setOrgUnitFiltered] = useState([]);
    const [orgUnitExpanded, setOrgUnitExpanded] = useState([]);
    const [filterValue, setFilterValue] = useState('');
    const [filterLoading, setFilterLoading] = useState(false);
    const [fetchErrors, setFetchErrors] = useState(undefined);
    const [loadingBulkAction, setLoadingBulkAction] = useState(false);

    const { loading: ouMetadataLoading, data: ouMetadata } =
        useDataQuery(orgUnitsQuery);
    const oUnits = useDataQuery(ouQuery, {
        variables: { id: id, level: level },
    });
    const oUnitsByGroups = useDataQuery(ouGroupQuery, {
        variables: { id: id, groupId: groupId },
    });
    const searchOunits = useDataQuery(searchOrgUnitQuery, {
        variables: { filterString: filterString },
    });
    const { loading: metadataLoading, data: prgMetaData } =
        useDataQuery(programMetadata, {
            onError: (err) => {
                setFetchErrors(parseErrorsUL(err.details));
            }
        });
    const { loading: poLoading, data: prgOrgUnitData } = useDataQuery(
        programOrgUnitsQuery,
        { variables: { id: id } }
    );

    const metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            console.error(err.details)
            setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            setOrgUnitProgram(undefined)
        }
    });

    let userOrgUnits;

    const cutOrgUnitsPath = (route) => {
        const routeParts = route.split('/');
        let routeCut = '/';
        for (let index = 1; index < routeParts.length; index++) {
            if (userOrgUnits.includes(routeParts[index])) {
                break;
            } else {
                routeCut = routeCut + routeParts[index] + '/'
            }
        }
        return route.replace(routeCut, '/');
    }

    useEffect(() => {
        if (!poLoading && userOrgUnits) {
            const ouPaths = [...prgOrgUnitData.results?.organisationUnits.map((ou) => ou.path)];
            const ouIds = [...prgOrgUnitData.results?.organisationUnits.map((ou) => ou.id)];
            if (ouPaths.length > 0 && ouIds.length > 0) {
                setOrgUnitPathSelected(ouPaths);
                setSelectedOrgUnits(ouIds);
            } else {
                ouTreeRootInit();
            }
        }
    }, [ouMetadata, prgOrgUnitData, userOrgUnits]);

    useEffect(() => {
        if (orgUnitPathSelected.length > 0) {
            ouTreeRootInit();
        }
    }, [orgUnitPathSelected, selectedOrgUnits])

    const ouTreeRootInit = () => {
        if (!ouMetadataLoading) {
            setOrgUnitTreeRoot([
                ...ouMetadata.userOrgUnits?.organisationUnits.map(
                    (ou) => ou.id
                ),
            ]);
        }
    }

    if (!ouMetadataLoading) {
        userOrgUnits = ouMetadata.userOrgUnits?.organisationUnits.map(
            (ou) => ou.id
        );
    }

    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data,
    };

    const hideFormHandler = () => {
        setOrgUnitProgram(undefined);
    };

    const orgUnitSelectionHandler = (event) => {
        if (event.checked) {
            setSelectedOrgUnits((prevState) => [...prevState, event.id]);
            setOrgUnitPathSelected((prevState) => [...prevState, event.path]);
        } else {
            setSelectedOrgUnits((prevState) =>
                prevState.filter(function (e) {
                    return e !== event.id;
                })
            );
            setOrgUnitPathSelected(
                orgUnitPathSelected.filter(function (e) {
                    return e !== event.path;
                })
            );
        }
        setHasChanges(true);
    };

    const doSearch = () => {
        setFilterLoading(true)
        const filterString = filterRef.current.value;
        if (filterString && filterString.trim() !== '') {
            setFilterValue(filterString)
            searchOunits.refetch({ filterString: filterString })
                .then((data) => {
                    if (data?.results) {
                        const filterResults = [
                            ...data.results?.organisationUnits.map(
                                (ou) => ou.path
                            ),
                        ].map(cutOrgUnitsPath)
                        setOrgUnitFiltered(filterResults);
                        setOrgUnitTreeRoot(userOrgUnits);
                        setOrgUnitExpanded(filterResults);
                    }
                    setFilterLoading(false)
                });
        } else {
            resetSearch();
        }
    }

    const resetSearch = () => {
        setFilterValue("")
        setOrgUnitFiltered([]);
        setOrgUnitExpanded([]);
        setOrgUnitTreeRoot(userOrgUnits);
        setFilterLoading(false)
    }

    const ouLevelAssignmentHandler = () => {
        const id = userOrgUnits[0];
        setLoadingBulkAction(true);
        const oulevel = parseInt(orgUnitLevel);
        oUnits.refetch({ id: id, level: oulevel }).then((data) => {
            if (data) { selectOrgUnits(data) }
            setLoadingBulkAction(false);
        });
    };

    const ouLevelRemovalHandler = () => {
        const id = userOrgUnits[0];
        setLoadingBulkAction(true);
        const oulevel = parseInt(orgUnitLevel);
        oUnits.refetch({ id: id, level: oulevel }).then((data) => {
            if (data) { deselectOrgUnits(data) }
            setLoadingBulkAction(false);
        });
    };

    const ouGroupAssignmentHandler = () => {
        const id = userOrgUnits[0];
        setLoadingBulkAction(true);
        oUnitsByGroups
            .refetch({ id: id, groupId: orgUnitGroup })
            .then((data) => {
                if (data) { selectOrgUnits(data) }
                setLoadingBulkAction(false);
            });
    };

    const ouGroupRemovalHandler = () => {
        const id = userOrgUnits[0];
        setLoadingBulkAction(true);
        oUnitsByGroups
            .refetch({ id: id, groupId: orgUnitGroup })
            .then((data) => {
                if (data) { deselectOrgUnits(data) }
                setLoadingBulkAction(false);
            });
    };

    const selectOrgUnits = (data) => {
        const ounits = data.results?.organisationUnits || [];

        const ounitsIdList = ounits.map((ou) => ou.id);
        const ounitsPathList = ounits.map((ou) => ou.path);

        setSelectedOrgUnits((prevState) => concatArraysUnique(prevState, ounitsIdList));
        setOrgUnitPathSelected((prevState) => concatArraysUnique(prevState, ounitsPathList));

        setHasChanges(true);
    };

    const deselectOrgUnits = (data) => {
        const ounits = data.results?.organisationUnits || [];
        setSelectedOrgUnits((prevState) =>
            prevState.filter((ou) => !ounits.find((ou2) => ou2.id === ou))
        );
        setOrgUnitPathSelected((prevState) =>
            prevState.filter((ou) => !ounits.find((ou2) => ou2.path === ou))
        );
        setHasChanges(true);
    };

    const orgUnitAssignmentHandler = () => {
        setContent("loading");
        if (!metadataLoading) {
            const metadata = {};
            metadata.programs = prgMetaData.results?.programs;
            metadata.programs[0].organisationUnits = selectedOrgUnits.map(
                (ounit) => {
                    return { id: ounit };
                }
            );
            metadataRequest.mutate({ data: metadata }).then((response) => {
                if (response.status !== "OK") {
                    setContent("status");
                } else {
                    setContent("status");
                    setNotification({
                        message: `Organisation Units assigned successfully! (Total: ${selectedOrgUnits.length})`,
                        severity: "success",
                    });
                    hideFormHandler();
                }
            });
        }
    };

    return (
        <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                <CustomMUIDialogTitle
                    onClose={hideFormHandler}
                    id={"orgUnit_assignemnt_dialog_title"}
                >
                    Assign Organisation Units for Program {prgMetaData && truncateString(prgMetaData.results?.programs[0].name, 40)}
                </CustomMUIDialogTitle>
                {orgUnitTreeRoot.length === 0 && (
                    <Box sx={{ display: "inline-flex", paddingLeft: "20px" }}>
                        <CircularProgress />
                    </Box>
                )}
                {orgUnitTreeRoot.length > 0 &&
                    <DialogContent dividers style={{ padding: "1em 2em" }}>
                        {content === "loading" && (
                            <Box sx={{ display: "inline-flex" }}>
                                <CircularProgress />
                            </Box>
                        )}
                        {content === "form" && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        minWidth: "850px",
                                    }}
                                >
                                    <TextField
                                        margin="dense"
                                        id={"filterOrgUnitName"}
                                        label={"Filter Organisation Units by UID, Code or Name"}
                                        helperText={"Please Note: The Organisation Unit Tree is not automatically expanded after filtering"}
                                        variant="outlined"
                                        inputRef={filterRef}
                                        value={filterValue}
                                        onChange={(event) => setFilterValue(event.target.value)}
                                        onKeyPress={(event) => {
                                            if (event.key === "Enter") {
                                                doSearch();
                                            }
                                        }}
                                        disabled={loadingBulkAction}
                                        sx={{ width: "100%" }}
                                        autoComplete={"off"}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip
                                                        title="Clear Filter"
                                                        placement="left"
                                                    ><span>
                                                            <IconButton
                                                                onClick={() => {
                                                                    resetSearch();
                                                                }}
                                                                style={{ marginRight: "0.5em" }}
                                                                disabled={filterLoading || loadingBulkAction}
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <LoadingButton
                                                        onClick={() => {
                                                            doSearch();
                                                        }}
                                                        startIcon={<SearchIcon />}
                                                        variant="contained"
                                                        color="primary"
                                                        loading={filterLoading || loadingBulkAction}
                                                    >
                                                        Filter
                                                    </LoadingButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <div style={{ marginTop: "10px" }}>
                                        {" "}
                                        {selectedOrgUnits.length} Organisation Units
                                        selected{" "}
                                    </div>
                                    {!poLoading && orgUnitTreeRoot.length > 0 && (
                                        <div
                                            style={{
                                                minHeight: "300px",
                                                maxHeight: "300px",
                                                minWidth: "300px",
                                                maxWidth: "300px",
                                                overflow: "auto",
                                                border: "1px solid rgb(189, 189, 189)",
                                                borderRadius: "3px",
                                                padding: "4px",
                                                margin: "4px 0px",
                                                display: "inline-block",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            <OrganisationUnitTree
                                                name={"Root org unit"}
                                                roots={orgUnitTreeRoot}
                                                onChange={orgUnitSelectionHandler}
                                                selected={orgUnitPathSelected}
                                                filter={orgUnitFiltered}
                                                highlighted={orgUnitExpanded}
                                            />
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            width: "450px",
                                            background: "white",
                                            marginLeft: "1rem",
                                            marginTop: "1rem",
                                            display: "inline-block",
                                        }}
                                    >
                                        <span>Select Organisation Units within:</span>
                                        <div style={{ flexDirection: "row", marginTop: '1em' }}>
                                            <FormControl
                                                variant={"standard"}
                                                style={{ width: "250px" }}
                                            >
                                                <InputLabel
                                                    id={
                                                        "organisation-unit-level-label"
                                                    }
                                                >
                                                    Organisation Unit Level
                                                </InputLabel>
                                                <Select
                                                    labelId={"orgUnitLevelId"}
                                                    label={
                                                        "Organisation Unit Level"
                                                    }
                                                    onChange={(event) =>
                                                        setOrgUnitLevel(
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <MenuItem
                                                        value={undefined}
                                                        key={undefined}
                                                    >
                                                        None
                                                    </MenuItem>
                                                    {!ouMetadataLoading &&
                                                        ouMetadata.orgUnitLevels?.organisationUnitLevels.map(
                                                            function (ouLevel) {
                                                                return (
                                                                    <MenuItem
                                                                        value={
                                                                            ouLevel.level
                                                                        }
                                                                        key={
                                                                            ouLevel.id
                                                                        }
                                                                    >
                                                                        <em>
                                                                            {
                                                                                ouLevel.displayName
                                                                            }
                                                                        </em>
                                                                    </MenuItem>
                                                                );
                                                            }
                                                        )}
                                                </Select>
                                            </FormControl>
                                            <ButtonGroup
                                                variant="outlined"
                                                style={{
                                                    marginTop: "12px",
                                                    marginLeft: "10px",
                                                }}
                                            >
                                                <Button
                                                    disabled={!orgUnitLevel || loadingBulkAction || filterLoading}
                                                    onClick={
                                                        ouLevelAssignmentHandler
                                                    }
                                                >
                                                    SELECT
                                                </Button>
                                                <Button
                                                    disabled={!orgUnitLevel || loadingBulkAction || filterLoading}
                                                    onClick={ouLevelRemovalHandler}
                                                >
                                                    DESELECT
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                        <div style={{ flexDirection: "row", marginTop: '1em' }}>
                                            <FormControl
                                                variant={"standard"}
                                                style={{ width: "250px" }}
                                            >
                                                <InputLabel
                                                    id={
                                                        "organisation-unit-Group-label"
                                                    }
                                                >
                                                    Organisation Unit Group
                                                </InputLabel>
                                                <Select
                                                    labelId={"orgUnitGroupId"}
                                                    label={
                                                        "Organisation Unit Group"
                                                    }
                                                    onChange={(event) =>
                                                        setOrgUnitGroup(
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <MenuItem
                                                        value={undefined}
                                                        key={undefined}
                                                    >
                                                        None
                                                    </MenuItem>
                                                    {!ouMetadataLoading &&
                                                        ouMetadata.orgUnitGroups?.organisationUnitGroups.map(
                                                            function (ouGroup) {
                                                                return (
                                                                    <MenuItem
                                                                        value={
                                                                            ouGroup.id
                                                                        }
                                                                        key={
                                                                            ouGroup.id
                                                                        }
                                                                    >
                                                                        <em>
                                                                            {
                                                                                ouGroup.displayName
                                                                            }
                                                                        </em>
                                                                    </MenuItem>
                                                                );
                                                            }
                                                        )}
                                                </Select>
                                            </FormControl>
                                            <ButtonGroup
                                                variant="outlined"
                                                style={{
                                                    marginTop: "12px",
                                                    marginLeft: "10px",
                                                }}
                                            >
                                                <Button
                                                    disabled={!orgUnitGroup || loadingBulkAction || filterLoading}
                                                    onClick={
                                                        ouGroupAssignmentHandler
                                                    }
                                                >
                                                    SELECT
                                                </Button>
                                                <Button
                                                    disabled={!orgUnitGroup || loadingBulkAction || filterLoading}
                                                    onClick={ouGroupRemovalHandler}
                                                >
                                                    DESELECT
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                        {loadingBulkAction &&
                                            <div style={{ width: '100%', marginTop: '1em' }}>
                                                <p>Loading Data</p>
                                                <LinearProgress />
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                        {content === "status" && (
                            <div>
                                <b>Something went wrong!</b>
                            </div>
                        )}
                        {fetchErrors &&
                            <Alert severity="error" style={{ marginTop: "10px", maxHeight: "100px", overflow: 'auto' }}>
                                <p>Assign Organisation Units feature disabled due to the following errors:</p>
                                {fetchErrors}
                            </Alert>
                        }
                    </DialogContent>
                }
                <DialogActions style={{ padding: "1em" }}>
                    <Button onClick={hideFormHandler} color={"error"}>
                        Close
                    </Button>
                    {hasChanges && !readOnly && (
                        <Button
                            onClick={orgUnitAssignmentHandler}
                            color={"primary"}
                            disabled={!!fetchErrors || loadingBulkAction}
                        >
                            Apply
                        </Button>
                    )}
                    {hasChanges && readOnly && (
                        <Tooltip title="You don't have access to edit this Program" placement="top" arrow>
                            <span>
                                <Button
                                    disabled={true}
                                    color={"primary"}
                                >
                                    Apply
                                </Button>
                            </span>
                        </Tooltip>
                    )}
                </DialogActions>
            </CustomMUIDialog>
        </>
    );
};

OunitScreen.propTypes = {
    id: PropTypes.string,
    readOnly: PropTypes.bool,
    setNotification: PropTypes.func,
    setOrgUnitProgram: PropTypes.func
}

export default OunitScreen;
