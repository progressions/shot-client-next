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
  Adventure,
} from "@/types"
import { getEntityId } from "@/lib/entityId"

class ApiV2 {
  // Normalizes an entity or string ID into a plain ID string.
  private id(entity?: { id?: string } | ID | string): string | undefined {
    return getEntityId(entity)
  }

  base(): string {
    return process.env.NEXT_PUBLIC_SERVER_URL as string
  }

  api(): string {
    return `${this.base()}/api/v2`
  }

  encounters(fight?: Fight | ID): string {
    const id = this.id(fight)
    return id ? `${this.api()}/encounters/${id}` : `${this.api()}/encounters`
  }

  characters(character?: Character | ID): string {
    const id = this.id(character)
    return id ? `${this.api()}/characters/${id}` : `${this.api()}/characters`
  }

  characterPdf(character: Character | ID): string {
    return `${this.characters(character)}/pdf`
  }

  vehicles(vehicle?: Vehicle | ID): string {
    const id = this.id(vehicle)
    return id ? `${this.api()}/vehicles/${id}` : `${this.api()}/vehicles`
  }

  backlinks(entityType: string, id: string): string {
    return `${this.api()}/backlinks/${entityType}/${id}`
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
    const id = this.id(site)
    return id ? `${this.api()}/sites/${id}` : `${this.api()}/sites`
  }

  junctures(juncture?: Juncture | ID): string {
    const id = this.id(juncture)
    return id ? `${this.api()}/junctures/${id}` : `${this.api()}/junctures`
  }

  parties(party?: Party | ID): string {
    const id = this.id(party)
    return id ? `${this.api()}/parties/${id}` : `${this.api()}/parties`
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

  // Adventures
  adventures(adventure?: Adventure | ID): string {
    const id = this.id(adventure)
    return id ? `${this.api()}/adventures/${id}` : `${this.api()}/adventures`
  }

  adventureCharacters(adventure: Adventure | ID, characterId?: string): string {
    const adventureUrl = this.adventures(adventure)
    return characterId
      ? `${adventureUrl}/characters/${characterId}`
      : `${adventureUrl}/characters`
  }

  adventureVillains(adventure: Adventure | ID, characterId?: string): string {
    const adventureUrl = this.adventures(adventure)
    return characterId
      ? `${adventureUrl}/villains/${characterId}`
      : `${adventureUrl}/villains`
  }

  adventureFights(adventure: Adventure | ID, fightId?: string): string {
    const adventureUrl = this.adventures(adventure)
    return fightId
      ? `${adventureUrl}/fights/${fightId}`
      : `${adventureUrl}/fights`
  }

  notionSyncLogsForAdventure(adventure: Adventure | ID): string {
    return `${this.adventures(adventure)}/notion_sync_logs`
  }

  syncAdventureFromNotion(adventure: Adventure | ID): string {
    return `${this.adventures(adventure)}/sync_from_notion`
  }

  notionAdventures(): string {
    return `${this.api()}/notion/adventures`
  }

  weapons(weapon?: Weapon | ID): string {
    const id = this.id(weapon)
    return id ? `${this.api()}/weapons/${id}` : `${this.api()}/weapons`
  }

  weaponJunctures(): string {
    return `${this.api()}/weapons/junctures`
  }

  weaponCategories(): string {
    return `${this.api()}/weapons/categories`
  }

  schticks(schtick?: Schtick | ID): string {
    const id = this.id(schtick)
    return id ? `${this.api()}/schticks/${id}` : `${this.api()}/schticks`
  }

  schtickCategories(): string {
    return `${this.api()}/schticks/categories`
  }

  schtickPaths(): string {
    return `${this.api()}/schticks/paths`
  }

  factions(faction?: Faction | ID): string {
    const id = this.id(faction)
    return id ? `${this.api()}/factions/${id}` : `${this.api()}/factions`
  }

  fights(fight?: Fight | ID): string {
    const id = this.id(fight)
    return id ? `${this.api()}/fights/${id}` : `${this.api()}/fights`
  }

  fightEvents(fight: Fight | ID | string): string {
    const fightId = this.id(fight)
    if (!fightId) {
      throw new Error("fightEvents requires a valid fight ID")
    }
    return `${this.api()}/fights/${fightId}/fight_events`
  }

  currentCampaign() {
    return `${this.campaigns()}/current`
  }

  campaigns(campaign?: Campaign | ID) {
    const id = this.id(campaign)
    return id ? `${this.api()}/campaigns/${id}` : `${this.api()}/campaigns`
  }

  resetAiCredits(campaign: Campaign | ID): string {
    // Note: Backend endpoint still named reset_grok_credits, frontend uses provider-agnostic naming
    return `${this.campaigns(campaign)}/reset_grok_credits`
  }

  campaignMemberships() {
    return `${this.api()}/campaign_memberships`
  }

  users(user?: User | ID): string {
    const id = this.id(user)
    return id ? `${this.api()}/users/${id}` : `${this.api()}/users`
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
    const id = this.id(invitation)
    return id ? `${this.api()}/invitations/${id}` : `${this.api()}/invitations`
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
    const weaponId = this.id(weapon)
    return weaponId
      ? `${characterUrl}/weapons/${weaponId}`
      : `${characterUrl}/weapons`
  }

  characterSchticks(character: Character | ID, schtick?: Schtick | ID): string {
    const characterUrl = this.characters(character)
    const schtickId = this.id(schtick)
    return schtickId
      ? `${characterUrl}/schticks/${schtickId}`
      : `${characterUrl}/schticks`
  }

  notion(): string {
    return `${this.api()}/notion`
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

  notionJunctures(): string {
    return `${this.api()}/notion/junctures`
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

  notionSyncLogsForSite(site: Site | ID): string {
    return `${this.sites(site)}/notion_sync_logs`
  }

  notionSyncLogsForParty(party: Party | ID): string {
    return `${this.parties(party)}/notion_sync_logs`
  }

  notionSyncLogsForFaction(faction: Faction | ID): string {
    return `${this.factions(faction)}/notion_sync_logs`
  }

  notionSyncLogsForJuncture(juncture: Juncture | ID): string {
    return `${this.junctures(juncture)}/notion_sync_logs`
  }

  syncSiteFromNotion(site: Site | ID): string {
    return `${this.sites(site)}/sync_from_notion`
  }

  syncPartyFromNotion(party: Party | ID): string {
    return `${this.parties(party)}/sync_from_notion`
  }

  syncFactionFromNotion(faction: Faction | ID): string {
    return `${this.factions(faction)}/sync_from_notion`
  }

  syncJunctureFromNotion(juncture: Juncture | ID): string {
    return `${this.junctures(juncture)}/sync_from_notion`
  }

  suggestions(): string {
    return `${this.api()}/suggestions`
  }

  // Search endpoint
  search(): string {
    return `${this.api()}/search`
  }

  // AI Credentials endpoints
  aiCredentials(credential?: AiCredential | ID): string {
    const id = this.id(credential)
    return id
      ? `${this.api()}/ai_credentials/${id}`
      : `${this.api()}/ai_credentials`
  }

  aiCredentialByProvider(provider: AiProvider): string {
    return `${this.api()}/ai_credentials/provider/${provider}`
  }

  // Notifications endpoints
  notifications(notification?: Notification | ID): string {
    const id = this.id(notification)
    return id
      ? `${this.api()}/notifications/${id}`
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
