import {
  ID,
  User,
  Campaign,
  Fight,
  Character,
  Vehicle,
  Site,
  Juncture,
  Party,
  Weapon,
  Schtick,
  Faction,
  Invitation,
  AiCredential,
  AiProvider,
  Notification,
} from "@/types"

class ApiV2 {
  base(): string {
    return process.env.NEXT_PUBLIC_SERVER_URL as string
  }

  api(): string {
    return `${this.base()}/api/v2`
  }

  encounters(fight?: Fight | ID | string): string {
    if (!fight) return `${this.api()}/encounters`
    const id = typeof fight === "string" ? fight : fight.id
    return `${this.api()}/encounters/${id}`
  }

  characters(character?: Character | ID): string {
    return character?.id
      ? `${this.api()}/characters/${character.id}`
      : `${this.api()}/characters`
  }

  characterPdf(character: Character | ID): string {
    return `${this.characters(character)}/pdf`
  }

  vehicles(vehicle?: Vehicle | ID): string {
    return vehicle?.id
      ? `${this.api()}/vehicles/${vehicle.id}`
      : `${this.api()}/vehicles`
  }

  chaseRelationships(): string {
    return `${this.api()}/chase_relationships`
  }

  chaseRelationship(id: string): string {
    return `${this.api()}/chase_relationships/${id}`
  }

  ai(): string {
    return `${this.api()}/ai`
  }

  aiImages(): string {
    return `${this.api()}/ai_images`
  }

  // Media Library endpoints
  mediaLibrary(imageId?: string): string {
    return imageId
      ? `${this.api()}/media_library/${imageId}`
      : `${this.api()}/media_library`
  }

  mediaLibraryBulkDelete(): string {
    return `${this.api()}/media_library/bulk_delete`
  }

  mediaLibraryDuplicate(imageId: string): string {
    return `${this.api()}/media_library/${imageId}/duplicate`
  }

  mediaLibraryAttach(imageId: string): string {
    return `${this.api()}/media_library/${imageId}/attach`
  }

  mediaLibraryDownload(imageId: string): string {
    return `${this.api()}/media_library/${imageId}/download`
  }

  mediaLibrarySearch(): string {
    return `${this.api()}/media_library/search`
  }

  mediaLibraryAiTags(): string {
    return `${this.api()}/media_library/ai_tags`
  }

  imagePositions(): string {
    return `${this.api()}/image_positions`
  }

  sites(site?: Site | ID): string {
    return site?.id ? `${this.api()}/sites/${site.id}` : `${this.api()}/sites`
  }

  junctures(juncture?: Juncture | ID): string {
    return juncture?.id
      ? `${this.api()}/junctures/${juncture.id}`
      : `${this.api()}/junctures`
  }

  parties(party?: Party | ID): string {
    return party?.id
      ? `${this.api()}/parties/${party.id}`
      : `${this.api()}/parties`
  }

  partyMembers(party: Party | ID, memberId?: string): string {
    const partyUrl = this.parties(party)
    return memberId ? `${partyUrl}/members/${memberId}` : `${partyUrl}/members`
  }

  partyTemplates(): string {
    return `${this.api()}/parties/templates`
  }

  partySlots(party: Party | ID, slotId?: string): string {
    const partyUrl = this.parties(party)
    return slotId ? `${partyUrl}/slots/${slotId}` : `${partyUrl}/slots`
  }

  partyApplyTemplate(party: Party | ID): string {
    return `${this.parties(party)}/apply_template`
  }

  partyReorderSlots(party: Party | ID): string {
    return `${this.parties(party)}/reorder_slots`
  }

  weapons(weapon?: Weapon | ID): string {
    return weapon?.id
      ? `${this.api()}/weapons/${weapon.id}`
      : `${this.api()}/weapons`
  }

  weaponJunctures(): string {
    return `${this.api()}/weapons/junctures`
  }

  weaponCategories(): string {
    return `${this.api()}/weapons/categories`
  }

  schticks(schtick?: Schtick | ID): string {
    return schtick?.id
      ? `${this.api()}/schticks/${schtick.id}`
      : `${this.api()}/schticks`
  }

  schtickCategories(): string {
    return `${this.api()}/schticks/categories`
  }

  schtickPaths(): string {
    return `${this.api()}/schticks/paths`
  }

  factions(faction?: Faction | ID): string {
    return faction?.id
      ? `${this.api()}/factions/${faction.id}`
      : `${this.api()}/factions`
  }

  fights(fight?: Fight | ID): string {
    return fight?.id
      ? `${this.api()}/fights/${fight.id}`
      : `${this.api()}/fights`
  }

  fightEvents(fight: Fight | ID | string): string {
    const fightId = typeof fight === "string" ? fight : fight?.id
    if (!fightId) {
      throw new Error("fightEvents requires a valid fight ID")
    }
    return `${this.api()}/fights/${fightId}/fight_events`
  }

  currentCampaign() {
    return `${this.campaigns()}/current`
  }

  campaigns(campaign?: Campaign | ID) {
    return campaign
      ? `${this.api()}/campaigns/${campaign.id}`
      : `${this.api()}/campaigns`
  }

  resetAiCredits(campaign: Campaign | ID): string {
    // Note: Backend endpoint still named reset_grok_credits, frontend uses provider-agnostic naming
    return `${this.campaigns(campaign)}/reset_grok_credits`
  }

  campaignMemberships() {
    return `${this.api()}/campaign_memberships`
  }

  users(user?: User | ID): string {
    return user ? `${this.api()}/users/${user.id}` : `${this.api()}/users`
  }

  usersRegister(): string {
    return `${this.api()}/users/register`
  }

  currentUser(): string {
    return `${this.api()}/users/current`
  }

  linkDiscord(): string {
    return `${this.api()}/users/link_discord`
  }

  unlinkDiscord(): string {
    return `${this.api()}/users/unlink_discord`
  }

  changePassword(): string {
    return `${this.api()}/users/change_password`
  }

  dismissCongratulations(): string {
    return `${this.api()}/onboarding/dismiss_congratulations`
  }

  onboarding(): string {
    return `${this.api()}/onboarding`
  }

  invitations(invitation?: Invitation | ID): string {
    return invitation?.id
      ? `${this.api()}/invitations/${invitation.id}`
      : `${this.api()}/invitations`
  }

  invitationRedeem(invitation: Invitation | ID): string {
    return `${this.invitations(invitation)}/redeem`
  }

  invitationRegister(invitation: Invitation | ID): string {
    return `${this.invitations(invitation)}/register`
  }

  invitationResend(invitation: Invitation | ID): string {
    return `${this.invitations(invitation)}/resend`
  }

  advancements(character: Character | ID, advancementId?: string): string {
    const characterUrl = this.characters(character)
    if (advancementId) {
      return `${characterUrl}/advancements/${advancementId}`
    }
    return `${characterUrl}/advancements`
  }

  characterWeapons(character: Character | ID, weapon?: Weapon | ID): string {
    const characterUrl = this.characters(character)
    return weapon?.id
      ? `${characterUrl}/weapons/${weapon.id}`
      : `${characterUrl}/weapons`
  }

  characterSchticks(character: Character | ID, schtick?: Schtick | ID): string {
    const characterUrl = this.characters(character)
    return schtick?.id
      ? `${characterUrl}/schticks/${schtick.id}`
      : `${characterUrl}/schticks`
  }

  notionCharacters(): string {
    return `${this.api()}/notion/characters`
  }

  notionSites(): string {
    return `${this.api()}/notion/sites`
  }

  notionParties(): string {
    return `${this.api()}/notion/parties`
  }

  notionFactions(): string {
    return `${this.api()}/notion/factions`
  }

  createNotionPage(character: Character | ID): string {
    return `${this.characters(character)}/notion/create`
  }

  createCharacterFromNotion(): string {
    return `${this.api()}/characters/from_notion`
  }

  notionSyncLogs(character: Character | ID): string {
    return `${this.characters(character)}/notion_sync_logs`
  }

  suggestions(): string {
    return `${this.api()}/suggestions`
  }

  // AI Credentials endpoints
  aiCredentials(credential?: AiCredential | ID): string {
    return credential?.id
      ? `${this.api()}/ai_credentials/${credential.id}`
      : `${this.api()}/ai_credentials`
  }

  aiCredentialByProvider(provider: AiProvider): string {
    return `${this.api()}/ai_credentials/provider/${provider}`
  }

  // Notifications endpoints
  notifications(notification?: Notification | ID): string {
    return notification?.id
      ? `${this.api()}/notifications/${notification.id}`
      : `${this.api()}/notifications`
  }

  notificationsUnreadCount(): string {
    return `${this.api()}/notifications/unread_count`
  }

  notificationsDismissAll(): string {
    return `${this.api()}/notifications/dismiss_all`
  }

  // WebAuthn/Passkey endpoints
  webauthnRegisterOptions(): string {
    return `${this.api()}/webauthn/register/options`
  }

  webauthnRegisterVerify(): string {
    return `${this.api()}/webauthn/register/verify`
  }

  webauthnAuthenticateOptions(): string {
    return `${this.api()}/webauthn/authenticate/options`
  }

  webauthnAuthenticateVerify(): string {
    return `${this.api()}/webauthn/authenticate/verify`
  }

  webauthnCredentials(): string {
    return `${this.api()}/webauthn/credentials`
  }

  webauthnCredential(credentialId: string): string {
    return `${this.api()}/webauthn/credentials/${credentialId}`
  }

  // Player View magic link endpoints
  playerTokens(encounterId: string): string {
    return `${this.api()}/encounters/${encounterId}/player_tokens`
  }

  playerTokenRedeem(token: string): string {
    return `${this.api()}/player_tokens/${token}/redeem`
  }

  // CLI Authorization endpoints
  cliAuthApprove(): string {
    return `${this.api()}/cli/auth/approve`
  }

  cliSessions(): string {
    return `${this.api()}/cli/sessions`
  }
}

export default ApiV2
