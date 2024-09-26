import ForgeUI, {
    render,
    AdminPage,
    Fragment,
    Form,
    Select,
    Option,
    Toggle,
    Text,
    Strong,
    TextField,
    CheckboxGroup,
    Checkbox,
    useState,
    useEffect,
    SectionMessage, useProductContext,
} from '@forge/ui';
import { format } from "date-fns";
import { storage } from '@forge/api';

const App = () => {
    const [projectConfigState, setProjectConfigState] = useState("");
    const [isProjectConfigSubmitted, setProjectConfigSubmitted] = useState(false);
   
    const onProjectConfigSubmit = async (projectConfig) => {
        await storage.set(`SIRP_Instance_Identifier`, projectConfig);
        setProjectConfigState(projectConfig);
        setProjectConfigSubmitted(true);
    };
    const isToggleConfigSelected = (name) => projectConfigState && projectConfigState[name] && { defaultChecked: true }
    return (
        <Fragment>
            <Text><Strong>SIRP SOAR</Strong></Text>
                <Form onSubmit={onProjectConfigSubmit} submitButtonText="Submit">
                    <TextField name="SIRP_Instance_Identifier" label="SIRP_Instance_Identifier" isRequired={true}  />
                    <TextField name="SIRP_APIToken" label="SIRP_APIToken" isRequired={true} />

                     <Toggle {...isToggleConfigSelected('AutoCloseStatus')} label="AutoCloseStatus" name="AutoCloseStatus" />
                </Form>
            { isProjectConfigSubmitted && <SectionMessage title="Configuration Saved Successfully" appearance="confirmation"/>}
        </Fragment>
    );
};

export const runConfigurePage = render(
    <AdminPage>
        <App />
    </AdminPage>
);
