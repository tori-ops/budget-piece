import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

/**
 * Creates a Supabase server client for reading session
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle server-side cookie errors silently
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user's ID
 * Returns null if not authenticated (doesn't redirect - let caller handle it)
 */
export async function getCurrentUserId(): Promise<string | null> {
  'use server';
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    console.log('getCurrentUserId - user:', user?.id, user?.email);

    return user?.id ?? null;
  } catch (error) {
    console.error('getCurrentUserId - error:', error);
    return null;
  }
}

/**
 * Require that the user is a member of a specific event
 * Returns the EventMember role if valid
 * Throws 403 error if not a member
 */
export async function requireEventMember(eventId: string): Promise<string> {
  'use server';
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const member = await prisma.eventMember.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error(`User ${userId} is not a member of event ${eventId}`);
  }

  return member.role;
}

/**
 * Role-based access control
 * Checks if the given role is allowed to perform an action
 */
export type RoleType =
  | 'COUPLE_OWNER'
  | 'COUPLE_EDITOR'
  | 'HELPER_EDITOR'
  | 'HELPER_VIEWER'
  | 'PLANNER_READONLY';

export interface RolePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: RoleType): RolePermissions {
  switch (role) {
    case 'COUPLE_OWNER':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManageMembers: true,
      };

    case 'COUPLE_EDITOR':
      return {
        canRead: true,
        canWrite: true,
        canDelete: false,
        canManageMembers: false,
      };

    case 'HELPER_EDITOR':
      return {
        canRead: true,
        canWrite: true,
        canDelete: false,
        canManageMembers: false,
      };

    case 'HELPER_VIEWER':
    case 'PLANNER_READONLY':
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canManageMembers: false,
      };

    default:
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManageMembers: false,
      };
  }
}

/**
 * Require write permission
 * Throws error if user role doesn't have write access
 */
export function requireWritePermission(role: RoleType): void {
  const permissions = getRolePermissions(role);
  if (!permissions.canWrite) {
    throw new Error(
      `Role ${role} does not have write permission. Status: 403`
    );
  }
}

/**
 * Require delete permission
 */
export function requireDeletePermission(role: RoleType): void {
  const permissions = getRolePermissions(role);
  if (!permissions.canDelete) {
    throw new Error(
      `Role ${role} does not have delete permission. Status: 403`
    );
  }
}

/**
 * Require member management permission
 */
export function requireMemberManagementPermission(role: RoleType): void {
  const permissions = getRolePermissions(role);
  if (!permissions.canManageMembers) {
    throw new Error(
      `Role ${role} does not have member management permission. Status: 403`
    );
  }
}
