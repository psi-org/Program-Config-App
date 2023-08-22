import { Alert, FormLabel } from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import { AlertBar, OrganisationUnitTree } from "@dhis2/ui";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import SelectOptions from "../UIElements/SelectOptions";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { AGG_TYPES_H2_PI, BUILD_VERSION } from "../../configs/Constants";

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

const H2Setting = forwardRef((props, ref) => {
    let id;
    const { loading: ouMetadataLoading, data: ouMetadata } = useDataQuery(orgUnitsQuery);
    const { loading: ouLevelLoading, data: getOuLevel, refetch: ouLevelRefetch, error: noOULevelFound } = useDataQuery(ouUnitQuery, { variables: { id: id } });

    const { data: haQuery, refetch: findHealthAreas } = useDataQuery(query, {
        lazy: true,
    });

    const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
    const [orgUnitTreeRoot, setOrgUnitTreeRoot] = useState([]);
    const [orgUnitPathSelected, setOrgUnitPathSelected] = useState([]);
    const [haOptions, setHaOptions] = useState();
    const [ouLevels, setOULevels] = useState();
    const [aggregationType, setAggregationType] = useState(props.pcaMetadata?.programIndicatorsAggType || 'AVERAGE');
    const [useCompetency, setUseCompetency] = useState(props.pcaMetadata?.useCompetencyClass === "Yes");

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
        aggregationType: undefined
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

    let ouTreeNLevelInit = () => {
        setOrgUnitTreeRoot([...ouMetadata.userOrgUnits?.organisationUnits.map(ou => ou.id)]);
        setOULevels(ouMetadata.orgUnitLevels?.organisationUnitLevels);

        setorgUnitTreeRootLoaded(true)
    }

    useEffect(() => {
        if (orgUnitTreeRoot.length > 0) {
            props.setButtonDisabled(false)
        }
    }, [orgUnitTreeRoot])

    const orgUnitSelectionHandler = (event) => {
        if (event.checked) {
            ouLevelRefetch({ id: event.id }).then((data) => {
                if (typeof data.result !== "undefined") {
                    let ouLevels =
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
                selectedOrgUnits.length === 0
            )
                response = false;
            console.log("selected Org Units: ", selectedOrgUnits);
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
            console.log("Validation Errors: ", validationErrors);
            return response;
        },

        saveMetaData() {
            let data = {};
            data.saveVersion = BUILD_VERSION;
            data.buildVersion = props.pcaMetadata?.buildVersion;
            data.useCompetencyClass = useCompetency ? "Yes" : "No";
            data.healthArea = healthArea;
            data.ouRoot = selectedOrgUnits[0];
            data.useUserOrgUnit = useUserOrgUnit ? "Yes" : "No";
            data.ouLevelTable = ouTableRow;
            data.ouLevelMap = ouMapPolygon;
            data.programIndicatorsAggType = aggregationType;
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
                            width: "40%",
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
                            width: "55%",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
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
                        <fieldset
                            style={{
                                borderRadius: "0.5em",
                                padding: "10px",
                                border: "1px solid rgb(189, 189, 189)",
                                marginTop: '1em'
                            }}
                        >
                            <FormControlLabel
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
                                    "Agg Type for Program Indicators (*)"
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
                        <fieldset
                            style={{
                                borderRadius: "0.5em",
                                padding: "10px",
                                border: "1px solid rgb(189, 189, 189)",
                                marginTop: '1em'
                            }}
                        >
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
                                styles={{ width: "100%" }}
                                value={healthArea}
                                defaultOption="Select Health Area"
                            />
                        </fieldset>
                    </div>
                </div>
            )
            }
        </>
    )
})

export default H2Setting