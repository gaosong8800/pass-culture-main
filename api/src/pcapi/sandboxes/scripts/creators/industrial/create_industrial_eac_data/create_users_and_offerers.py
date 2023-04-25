from pcapi.core.offerers import factories as offerers_factories
from pcapi.core.offerers import models as offerers_models


def create_users_offerers() -> list[offerers_models.Offerer]:
    offerers = []
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_1_lieu@example.com",
        offerer__name="eac_1_lieu",
        offerer__siren="552081317",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_2_lieu@example.com",
        offerer__name="eac_2_lieu [BON EAC]",
        offerer__siren="444608442",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="squad-eac@passculture.app",
        offerer=user_offerer.offerer,
    )

    # user with 2 offerer 1 eac and 1 non eac
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="half_eac@example.com",
        offerer=user_offerer.offerer,
    )
    offerers_factories.UserOffererFactory(
        user=user_offerer.user,
        offerer__name="no_eac",
        offerer__siren="542107651",
    )

    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_pending_bank_informations@example.com",
        offerer__name="eac_pending_bank_informations",
        offerer__siren="552046955",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_no_cb@example.com",
        offerer__name="eac_no_cb",
        offerer__siren="444786511",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_rejected@example.com",
        offerer__name="eac_rejected",
        offerer__siren="897492294",
    )
    offerers.append(user_offerer.offerer)
    # DMS state
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_accepte@example.com",
        offerer__name="eac_accepte",
        offerer__siren="538160524",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_sans_suite@example.com",
        offerer__name="eac_sans_suite",
        offerer__siren="538160656",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_en_construction@example.com",
        offerer__name="eac_en_construction",
        offerer__siren="843082389",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_refuse@example.com",
        offerer__name="eac_refuse",
        offerer__siren="524237351",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_en_instruction@example.com",
        offerer__name="eac_en_instruction",
        offerer__siren="538160615",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_complete_30d@example.com",
        offerer__name="eac_complete_30+d",
        offerer__siren="456500537",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_complete_30-d@example.com",
        offerer__name="eac_complete_30-d",
        offerer__siren="848009452",
    )
    offerers.append(user_offerer.offerer)
    user_offerer = offerers_factories.UserOffererFactory(
        user__email="eac_with_two_adage_venues@example.com",
        offerer__name="eac_with_two_adage_venues",
        offerer__siren="848171500",
    )
    offerers.append(user_offerer.offerer)

    return offerers
