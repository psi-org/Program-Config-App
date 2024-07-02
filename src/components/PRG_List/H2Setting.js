import { useDataQuery } from "@dhis2/app-runtime";
import { OrganisationUnitTree } from "@dhis2/ui";
import { Alert, FormLabel, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import LinearProgress from "@mui/material/LinearProgress";
import Switch from "@mui/material/Switch";
import PropTypes from 'prop-types';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { AGG_TYPES_H2_PI, BUILD_VERSION } from "../../configs/Constants.js";
import SelectOptions from "../UIElements/SelectOptions.js";

const query = {
    results: {
        resource: "optionSets",
        params: {
            fields: ["options[code,name]"],
            filter: ["id:eq:y752HEwvCGi"],
        },
    },
};

const orgUnitsQuery = {
    userOrgUnits: {
        resource: "me",
        params: {
            fields: ["organisationUnits[id, path]"],
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

const ouUnitQuery = {
    result: {
        resource: "organisationUnits",
        id: ({ id }) => id,
        params: {
            fields: ["id", "level", "path"],
        },
    },
};

const fieldSetStyle = {
    borderRadius: "0.5em",
    padding: "10px",
    border: "1px solid rgb(189, 189, 189)",
    marginTop: '0.5em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}

const H2Setting = forwardRef((props, ref) => {
    let id;
    const { loading: ouMetadataLoading, data: ouMetadata } = useDataQuery(orgUnitsQuery);
    const { loading: ouLevelLoading, refetch: ouLevelRefetch, error: noOULevelFound } = useDataQuery(ouUnitQuery, { variables: { id: id } });

    const { refetch: findHealthAreas } = useDataQuery(query, {
        lazy: true,
    });

    const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
    const [orgUnitTreeRoot, setOrgUnitTreeRoot] = useState([]);
    const [orgUnitPathSelected, setOrgUnitPathSelected] = useState([]);
    const [haOptions, setHaOptions] = useState();
    const [ouLevels, setOULevels] = useState();
    const [aggregationType, setAggregationType] = useState(props.pcaMetadata?.programIndicatorsAggType || 'AVERAGE');
    const [useCompetency, setUseCompetency] = useState(props.pcaMetadata?.useCompetencyClass === "Yes");
    const [createAndroidAnalytics, setCreateAndroidAnalytics] = useState(props.pcaMetadata?.createAndroidAnalytics === "Yes");
    const [teiDownloadAmount, setTeiDownloadAmount] = useState(props.pcaMetadata?.teiDownloadAmount || 5);

    const [useUserOrgUnit, setUseUserOrgUnit] = useState(props.pcaMetadata?.useUserOrgUnit === "Yes");
    const [ouTableRow, setOUTableRow] = useState(props.pcaMetadata?.ouLevelTable || "");
    const [ouMapPolygon, setOUMapPolygon] = useState(props.pcaMetadata?.ouLevelMap || "");
    const [healthArea, setHealthArea] = useState(props.pcaMetadata?.healthArea || "");
    const [orgUnitTreeRootLoaded, setorgUnitTreeRootLoaded] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        healthArea: undefined,
        ouTableRow: undefined,
        ouMapPolygon: undefined,
        orgUnitRoot: undefined,
        aggregationType: undefined,
        teiDownloadAmount: undefined
    })

    useEffect(() => {
        findHealthAreas().then((data) => {
            if (data?.results?.optionSets[0].options) {
                setHaOptions(data?.results?.optionSets[0].options);
            }
        });
    }, []);

    const handleUserOrgUnit = (event) => {
        setUseUserOrgUnit(event.target.checked);
    };

    const handleChangeComp = (event) => {
        setUseCompetency(event.target.checked);
    };

    const handleChangeAndroidAnalytics = (event) => {
        setCreateAndroidAnalytics(event.target.checked);
    };

    const healthAreaChange = (event) => {
        validationErrors.healthArea = undefined;
        setValidationErrors({ ...validationErrors });
        setHealthArea(event.target.value);
    };

    const ouTableRowChange = (event) => {
        validationErrors.ouTableRow = undefined;
        setValidationErrors({ ...validationErrors });
        setOUTableRow(event.target.value);
    };

    const ouMapPolygonChange = (event) => {
        validationErrors.ouMapPolygon = undefined;
        setValidationErrors({ ...validationErrors });
        setOUMapPolygon(event.target.value);
    };

    const aggregationTypeChange = (event) => {
        validationErrors.aggregationType = undefined;
        setValidationErrors({ ...validationErrors });
        setAggregationType(event.target.value);
    };

    const teiAmountChange = (event) => {
        validationErrors.teiDownloadAmount = undefined;
        setValidationErrors({ ...validationErrors });
        setTeiDownloadAmount(event.target.value);
    };

    let healthAreaOptions = [];
    let ouLevelOptions = [];

    if (haOptions) {
        healthAreaOptions = healthAreaOptions.concat(
            haOptions.map((op) => {
                return { label: op.name, value: op.code };
            })
        );
    }

    if (ouLevels) {
        ouLevelOptions = ouLevelOptions.concat(
            ouLevels.map((ou) => {
                return { label: ou.displayName, value: ou.id };
            })
        );
    }

    useEffect(() => {
        const checkAndResetValues = (key, setter) => {
            if (!ouMetadata.orgUnitLevels.organisationUnitLevels.some(olevel => olevel.id === key)) {
                setter("");
            }
        };

        const fetchDataAndSetState = async () => {
            const data = await ouLevelRefetch({ id: props.pcaMetadata?.ouRoot });
            if (data.result) {
                const ouLevels = ouMetadata.orgUnitLevels?.organisationUnitLevels.filter(
                    ol => ol.level >= data.result.level
                );
                setOrgUnitPathSelected([data.result.path]);
                setOULevels(ouLevels);
                setSelectedOrgUnits([props.pcaMetadata?.ouRoot]);
            }
        };

        const fetchOrgUnits = async () => {
            try {
                if (!ouMetadataLoading && props.pcaMetadata?.ouRoot) {
                    checkAndResetValues(props.pcaMetadata?.ouLevelTable, setOUTableRow);
                    checkAndResetValues(props.pcaMetadata?.ouLevelMap, setOUMapPolygon);

                    await fetchDataAndSetState();
                } else {
                    ouTreeNLevelInit();
                }
            } catch (error) {
                setSelectedOrgUnits([]);
                setOrgUnitPathSelected([]);
                setOULevels(ouMetadata);
            }
        };

        fetchOrgUnits();
    }, [ouMetadata]);

    useEffect(() => {
        if ((!ouLevelLoading && orgUnitPathSelected.length > 0) || noOULevelFound) {
            ouTreeNLevelInit(ouMetadata)
        }
    }, [orgUnitPathSelected, noOULevelFound])

    const ouTreeNLevelInit = () => {
        setOrgUnitTreeRoot([...ouMetadata.userOrgUnits?.organisationUnits.map(ou => ou.id)]);
        setOULevels(ouMetadata.orgUnitLevels?.organisationUnitLevels);

        setorgUnitTreeRootLoaded(true)
    }

    const orgUnitSelectionHandler = (event) => {
        if (event.checked) {
            ouLevelRefetch({ id: event.id }).then((data) => {
                if (typeof data.result !== "undefined") {
                    const ouLevels =
                        ouMetadata.orgUnitLevels?.organisationUnitLevels.filter(
                            (ol) => ol.level >= data.result.level
                        );
                    setOULevels(ouLevels);
                }
            });
            setSelectedOrgUnits([event.id]);
            setOrgUnitPathSelected([event.path]);
            validationErrors.orgUnitRoot = undefined;
        } else {
            setSelectedOrgUnits([]);
            setOrgUnitPathSelected([]);
        }
        setOUTableRow("");
        setOUMapPolygon("");
    };

    useImperativeHandle(ref, () => ({
        handleFormValidation() {
            let response = true;
            if (
                healthArea === "" ||
                ouTableRow === "" ||
                ouMapPolygon === "" ||
                aggregationType === "" ||
                selectedOrgUnits.length === 0 ||
                teiDownloadAmount === ""
            ) {
                response = false;
            }
            validationErrors.healthArea =
                healthArea === "" ? "This field is required" : undefined;
            
            validationErrors.ouTableRow =
                ouTableRow === "" ? "This field is required" : undefined;
            
            validationErrors.ouMapPolygon =
                ouMapPolygon === "" ? "This field is required" : undefined;
            
            validationErrors.orgUnitRoot =
                selectedOrgUnits.length === 0
                    ? "This field is required"
                    : undefined;
            
            validationErrors.aggregationType =
                aggregationType === "" ? "This field is required" : undefined;
            
            
            if (teiDownloadAmount === "") {
                validationErrors.teiDownloadAmount = "This field is required";
            } else if (teiDownloadAmount < 0 || teiDownloadAmount > 500) {
                validationErrors.teiDownloadAmount = "This field must contain a value between 0 and 500.";
                response = false;
            } else {
                validationErrors.teiDownloadAmount = undefined;
            }
            
            return response;
        },

        saveMetaData() {
            const data = {
                saveVersion:  BUILD_VERSION,
                buildVersion:  props.pcaMetadata?.buildVersion,
                useCompetencyClass:  useCompetency ? "Yes" : "No",
                healthArea:  healthArea,
                ouRoot:  selectedOrgUnits[0],
                useUserOrgUnit:  useUserOrgUnit ? "Yes" : "No",
                ouLevelTable:  ouTableRow,
                ouLevelMap:  ouMapPolygon,
                programIndicatorsAggType:  aggregationType,
                createAndroidAnalytics:  createAndroidAnalytics ? "Yes" : "No",
                teiDownloadAmount:  teiDownloadAmount
            };
            return data;
        }
    }))


    return (
        <>
            {!orgUnitTreeRootLoaded &&
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
            }
            {orgUnitTreeRootLoaded && orgUnitTreeRoot.length === 0 &&
                <Alert severity="error">Your user has not been assigned to any Organisation Units. Please contact your System Administrator for support.</Alert>
            }
            {orgUnitTreeRoot.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            width: "35%",
                            display: "flex",
                            flexDirection: "column",
                            alignSelf: "stretch",
                        }}
                    >
                        <FormLabel
                            sx={
                                validationErrors.orgUnitRoot !== undefined
                                    ? { color: "#d32f2f", marginTop: "0.5em" }
                                    : { marginTop: "0.5em" }
                            }
                        >
                            Organisation Unit Root for Global Analytics
                            (*)
                        </FormLabel>
                        <FormHelperText sx={{ color: "#d32f2f" }}>
                            {validationErrors.orgUnitRoot}
                        </FormHelperText>
                        <FormControl
                            variant={"standard"}
                            error={
                                validationErrors.orgUnitRoot !==
                                undefined
                            }
                            style={{
                                overflow: "auto",
                                border: "1px solid #bdbdbd",
                                borderRadius: "3px",
                                padding: "4px",
                                marginTop: "0.8em",
                                height: "400px",
                                maxHeight: "400px"
                            }}
                        >
                            <OrganisationUnitTree
                                name={"Root org unit"}
                                roots={orgUnitTreeRoot}
                                onChange={orgUnitSelectionHandler}
                                selected={orgUnitPathSelected}
                                initiallyExpanded={orgUnitPathSelected}
                                singleSelection
                            />
                        </FormControl>
                    </div>
                    <div
                        style={{
                            width: "60%",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                            <fieldset
                                style={{
                                    ...fieldSetStyle,
                                    flexDirection: "column",
                                    width: '49%',
                                    maxWidth: '49%',
                                    minWidth: '49%'
                                }}
                            >
                                <legend style={{ color: 'rgba(0, 0, 0, 0.6)'}}>Generated Dashboard Settings</legend>
                                <SelectOptions
                                    useError={
                                        validationErrors.ouTableRow !==
                                        undefined
                                    }
                                    helperText={validationErrors.ouTableRow}
                                    label={
                                        "Org Unit Level for the Dashboard Visualizations (*)"
                                    }
                                    items={ouLevelOptions}
                                    handler={ouTableRowChange}
                                    styles={{ width: "100%" }}
                                    value={ouTableRow}
                                    defaultOption={
                                        "Select Org Unit Level"
                                    }
                                />
                                <SelectOptions
                                    useError={
                                        validationErrors.ouMapPolygon !==
                                        undefined
                                    }
                                    helperText={validationErrors.ouMapPolygon}
                                    label={
                                        "Org Unit Level for the Dashboard Maps (*)"
                                    }
                                    items={ouLevelOptions}
                                    handler={ouMapPolygonChange}
                                    styles={{ width: "100%" }}
                                    value={ouMapPolygon}
                                    defaultOption={
                                        "Select Org Unit Level"
                                    }
                                />
                            </fieldset>
                            <fieldset
                                style={{
                                    ...fieldSetStyle,
                                    flexDirection: "column",
                                    width: '49%',
                                    maxWidth: '49%',
                                    minWidth: '49%'
                                }}
                            >
                                <legend style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Analytics Settings</legend>
                                <FormControlLabel
                                    style={{marginTop: '1em'}}
                                    control={
                                        <Switch
                                            checked={useUserOrgUnit}
                                            onChange={handleUserOrgUnit}
                                            name="userOrgUnit"
                                        />
                                    }
                                    label="Use User Org Units for Analytics when possible"
                                />
                                <SelectOptions
                                    useError={
                                        validationErrors.aggregationType !==
                                        undefined
                                    }
                                    helperText={validationErrors.aggregationType}
                                    label={
                                        "Aggregation Type for Program Indicators (*)"
                                    }
                                    items={AGG_TYPES_H2_PI}
                                    handler={aggregationTypeChange}
                                    styles={{ width: "100%" }}
                                    value={aggregationType}
                                    defaultOption={
                                        "Select Aggregation Type"
                                    }
                                />
                            </fieldset>
                        </div>
                        
                        <fieldset
                            style={{ ...fieldSetStyle, display: 'flex', justifyContent: 'space-between' }}
                        >
                            <legend style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Core HNQIS Settings</legend>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useCompetency}
                                        onChange={handleChangeComp}
                                        name="competency"
                                    />
                                }
                                label="Use Competency Class"
                            />
                            <SelectOptions
                                useError={
                                    validationErrors.healthArea !==
                                    undefined
                                }
                                helperText={validationErrors.healthArea}
                                label={"Program Health Area (*)"}
                                items={healthAreaOptions}
                                handler={healthAreaChange}
                                styles={{ width: "60%" }}
                                value={healthArea}
                                defaultOption="Select Health Area"
                            />
                        </fieldset>
                        <fieldset
                            style={fieldSetStyle}
                        >
                            <legend style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Android Capture App Settings</legend>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={createAndroidAnalytics}
                                        onChange={handleChangeAndroidAnalytics}
                                        name="createAnalytics"
                                    />
                                }
                                label="Create Android Dashboard Analytics"
                            />
                            <TextField
                                error={validationErrors.teiDownloadAmount !== undefined}
                                helperText={validationErrors.teiDownloadAmount}
                                margin="normal"
                                id="teiDownloadAmount"
                                label="Max TEI Download Amount (*)"
                                type="number"
                                fullWidth
                                variant="standard"
                                autoComplete="off"
                                inputProps={{ min: 0, max: 500 }}
                                value={teiDownloadAmount}
                                onChange={teiAmountChange}
                            />
                        </fieldset>
                    </div>
                </div>
            )
            }
        </>
    )
})

H2Setting.displayName = 'H2Setting';

H2Setting.propTypes = {
    pcaMetadata: PropTypes.object
}

export default H2Setting