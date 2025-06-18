import User from "../../models/user.model.js";
import { getCodeforceRatingHistory } from "../../services/codeforce.api.js";
import UserData from "../../models/userData.model.js";
import updateforAll from "../../helpers/updateforAll.js";

const codeforceRatingChangeJob = async () => {
    console.log("Codeforces Rating Change Job started");
    const users = await User.find()

}