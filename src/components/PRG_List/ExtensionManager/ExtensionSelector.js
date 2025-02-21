import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Card, CardActions, CardContent } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const extensions = [
    {
        name: 'HNQIS 2.0',
        description: 'Required Metadata to access HNQIS 2.0 features.',
        key: 'h2Ready'
    },
    {
        name: 'HNQIS MWI',
        description: 'Required Metadata to access HNQIS MWI features. This is a custom implementation of HNQIS 2.0.',
        key: 'hMWIReady'
    }
];

const ExtensionSelector = ({status, onSelect}) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1em' }}>
            {extensions.map(extension => (
                <Card
                    key={extension.key}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                    <CardContent>
                        <h3>{extension.name}</h3>
                        <p>{extension.description}</p>
                    </CardContent>
                    <CardActions
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Button onClick={() => onSelect(extension.key)}>
                            Manage
                        </Button>
                        {status[extension.key]!== undefined &&
                            status[extension.key]
                            ? <Button
                                color='success'
                                startIcon={<CheckCircleIcon />}
                            >
                                Available
                            </Button>
                            : <Button
                                color='error'
                                startIcon={<CancelIcon />}
                            >
                                Missing
                            </Button>
                        }
                    </CardActions>
                </Card>
            ))}
        </div>
    );
}

ExtensionSelector.propTypes = {
    status: PropTypes.object,
    onSelect: PropTypes.func
};

export default ExtensionSelector;