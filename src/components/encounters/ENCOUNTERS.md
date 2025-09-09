# Encounters Component Architecture

This document outlines the conventions and architecture of the components within `src/components/encounters`.

## Component Styles and Structure

Components in the `encounters` directory are built using Material-UI and follow a compositional pattern. Larger, more complex components are assembled from smaller, focused ones.

### Key Styling Conventions:

-   **Material-UI:** The primary UI library is `@mui/material`. Components like `Box`, `Paper`, `Stack`, and `Grid` are used for layout.
-   **`sx` Prop:** Styling is applied directly to components using the `sx` prop, allowing for inline styles that can access the theme.
-   **`BasePanel.tsx`:** This is a foundational component that creates a consistent look and feel for action panels (e.g., `CheeseItPanel`, `AttackPanel`). It provides a `Paper` container with a title, icon, and a customizable border color.
-   **Composition:** Complex components are built by combining smaller ones. For example, the `Encounter.tsx` component is composed of `FightName`, `Alert`, and `ShotCounter`.

## Form Entries and Interactions

Forms and user interactions are handled using a combination of Material-UI components, custom components, and React hooks.

### Form Conventions:

-   **Controlled Components:** Form inputs are controlled components, with their values managed by `useState` hooks.
-   **Material-UI and Custom Components:** Standard form elements are from Material-UI (`TextField`, `Select`, `Autocomplete`). The project also includes custom form components like `NumberField`.
-   **State Management:** The state for each form is managed locally within the component using `useState`.
-   **Validation:** Basic validation is performed within the component, often in a `isValid()` function that checks the state of the form fields before submission.

### Interaction Conventions:

-   **Event Handlers:** Interactions are triggered by event handlers like `onClick` and `onChange`.
-   **Contexts:** The `useEncounter`, `useToast`, and `useClient` hooks are used extensively to interact with the application's state:
    -   `useEncounter`: Provides access to the current encounter state and a function to update it (`updateEncounter`).
    -   `useToast`: Used to display success or error notifications to the user.
    -   `useClient`: Provides access to the API client for making requests to the backend.
-   **Dialogs:** Complex interactions, like editing a character, are often handled within a `Dialog` component (e.g., `CharacterEditDialog.tsx`).

## API Usage and Character Updates

The `client` object from the `useClient` hook is the central point for all API communication. This client is an abstraction over the backend API, with methods that correspond to specific backend endpoints.

### API Client

The `client` object provides methods for fetching and updating data. The URLs for these requests are constructed by the `Api` class in `src/lib/Api.ts`.

### Patterns for Updating Character Data

There are two primary patterns for updating character data in an encounter:

1.  **Direct, Granular Updates:**

    This pattern is used for editing a character's stats directly, as seen in `CharacterEditDialog.tsx`. It involves making specific API calls to update individual attributes of the character or related entities.

    -   **Example Methods:**
        -   `client.updateCharacterCombatStats(characterId, payload)`
        -   `client.updateVehicle(vehicleId, payload)`
        -   `client.updateCharacterShot(encounter, character, payload)`

    -   **Workflow:**
        1.  The user modifies data in a form.
        2.  On save, the component calls one or more specific `client` methods to update the data in the backend.
        3.  After the updates are successful, the component refetches the entire encounter state using `client.getEncounter(encounter)`.
        4.  The updated encounter state is then passed to `updateEncounter` from the `useEncounter` hook, which updates the context and re-renders the UI.

2.  **Action-Based Updates:**

    This pattern is used for in-fight actions that have specific game mechanics and consequences, such as attacking or attempting to escape. It involves sending a structured "action" or "event" payload to a more generic endpoint.

    -   **Example Method:**
        -   `client.applyCombatAction(encounter, [characterUpdate])`

    -   **Workflow:**
        1.  The user initiates an action (e.g., clicks the "Cheese It!" button).
        2.  The component constructs a `characterUpdate` object that describes the action. This object typically includes:
            -   `shot_id`: The ID of the character's shot in the encounter.
            -   `character_id`: The ID of the character.
            -   New values for attributes like `shot`.
            -   An `event` object with a `type`, `description`, and `details` of the action.
        3.  This payload is sent to the backend via `client.applyCombatAction`.
        4.  The backend processes the action and updates the encounter state. The changes are then broadcast back to the client via WebSockets, which triggers a re-render.

## Encounter Action Bar

The `EncounterActionBar` component provides a set of actions that can be performed on a selected character in an encounter. The action bar is a central part of the encounter UI, and it is designed to be easily extensible.

### Available Actions

The following actions are available in the action bar:

-   **Attack:** Opens the `AttackPanel` to perform an attack.
-   **Chase:** Opens the `ChasePanel` for vehicle-related actions.
-   **Boost:** Opens the `BoostPanel` to boost a character's stats.
-   **Heal:** Opens the `HealPanel` to heal a character.
-   **Cheese It:** Opens the `CheeseItPanel` to attempt to escape from the fight.
-   **Speed Check:** Opens the `SpeedCheckPanel` to prevent another character from escaping.
-   **Up Check:** Opens the `UpCheckPanel` to perform an up check for a character.

### Adding New Actions

To add a new action to the `EncounterActionBar`, follow these guidelines:

1.  **Create a Panel Component:**
    -   Create a new panel component for your action (e.g., `MyActionPanel.tsx`).
    -   This panel should be based on the `BasePanel` component to maintain a consistent style.

2.  **Add a Button to the Action Bar:**
    -   Open `EncounterActionBar.tsx` and add a new `MenuButton` for your action.
    -   The `onClick` handler should call `handleAction` with a unique string identifier for your action (e.g., `handleAction("my_action")`).

3.  **Implement the Panel in the Parent Component:**
    -   In the parent component that renders the `EncounterActionBar` (likely `Encounter.tsx` or a similar component), add a state to manage the active panel.
    -   Conditionally render your new panel component when the active panel state matches your action's identifier.

### Button Disabling

-   **Character Selection:** All action buttons in the `EncounterActionBar` must be disabled until a valid character is selected in the `CharacterSelector`.
-   **Additional Conditions:** You can add other conditions to the `disabled` prop of your `MenuButton` based on the selected character's stats or status (e.g., disable the "Attack" button if the character has no attack skills).

### Badges

-   If there is a meaningful number associated with an action, you can add a `Badge` to the `MenuButton`.
-   For example, the "Up Check" button has a badge that shows the number of characters who require an up check.
-   To add a badge, wrap the `MenuButton` in a `Badge` component and provide the `badgeContent` and `color` props.