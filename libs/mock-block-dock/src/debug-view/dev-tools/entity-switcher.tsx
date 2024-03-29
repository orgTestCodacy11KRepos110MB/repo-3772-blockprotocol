import {
  Box,
  Button,
  MenuItem,
  Popover,
  Select,
  Typography,
} from "@mui/material";
import { MouseEvent, useState } from "react";

import { useMockBlockDockContext } from "../../mock-block-dock-context";
import { JsonView } from "./json-view";

/**
 * Interface to change the entity selected for loading into a block
 * 1. Choose the entity type the user wants to look for entities from
 * 2. Choose an entity of that type as a candidate for loading into the block
 * 3. Confirm the choice to send the entityId of the chosen entity
 */
export const EntitySwitcher = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { blockEntity, setEntityIdOfEntityForBlock, datastore } =
    useMockBlockDockContext();

  const [entityTypeId, setEntityTypeId] = useState(blockEntity.entityTypeId);
  const [entityId, setEntityIdOfProposedEntityForBlock] = useState<
    string | undefined
  >(blockEntity.entityId);

  const selectedEntity = datastore.entities.find(
    (entity) =>
      entity.entityId === entityId && entity.entityTypeId === entityTypeId,
  );

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const handleSubmit = () => {
    if (selectedEntity) {
      setEntityIdOfEntityForBlock(selectedEntity.entityId);
    }
    closePopover();
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Button
        size="small"
        component="button"
        id="entity-switcher-trigger"
        aria-controls={open ? "entity-switcher-popover" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          textTransform: "none",
          color: "inherit",
          lineHeight: 1,
          opacity: 0.9,
        }}
      >
        Switch Entity
      </Button>
      <Popover
        id="entity-switcher-popover"
        aria-labelledby="entity-switcher-trigger"
        anchorEl={anchorEl}
        open={open}
        onClose={closePopover}
        PaperProps={{
          sx: {
            p: 3,
            display: "flex",
          },
        }}
      >
        <Box width={150} display="flex" flexDirection="column" mr={3}>
          <Box>
            <Typography
              component="label"
              htmlFor="entity-type-id-selector"
              fontWeight={500}
              variant="caption"
            >
              Entity Type Id
            </Typography>
            <Select
              size="small"
              id="entity-type-id-selector"
              value={entityTypeId}
              onChange={(event) => {
                if (event.target.value !== entityTypeId) {
                  setEntityIdOfProposedEntityForBlock(undefined);
                }
                setEntityTypeId(event.target.value);
              }}
              sx={{ mb: 2 }}
              fullWidth
            >
              {datastore.entityTypes.map((type) => (
                <MenuItem key={type.entityTypeId} value={type.entityTypeId}>
                  {type.entityTypeId}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="entity-id-selector"
              fontWeight={500}
              variant="caption"
            >
              Entity Id
            </Typography>
            <Select
              id="entity-id-selector"
              size="small"
              value={entityId}
              placeholder="Select Entity"
              onChange={(event) => {
                setEntityIdOfProposedEntityForBlock(event.target.value);
              }}
              sx={{
                mb: 2,
              }}
              fullWidth
            >
              {datastore.entities
                .filter((entity) => entity.entityTypeId === entityTypeId)
                .map((entity) => (
                  <MenuItem key={entity.entityId} value={entity.entityId}>
                    {entity.entityId}
                  </MenuItem>
                ))}
            </Select>
          </Box>

          <Button
            variant="contained"
            disableFocusRipple
            disableRipple
            sx={{ textTransform: "none" }}
            onClick={handleSubmit}
          >
            Switch Entity
          </Button>
        </Box>
        <Box
          sx={{
            ".react-json-view": {
              height: 250,
              width: 400,
              overflowY: "scroll",
            },
          }}
        >
          <JsonView
            rootName="properties"
            collapseKeys={[]}
            src={selectedEntity?.properties ?? {}}
            enableClipboard={false}
            quotesOnKeys={false}
            displayObjectSize={false}
            displayDataTypes={false}
          />
        </Box>
      </Popover>
    </Box>
  );
};
